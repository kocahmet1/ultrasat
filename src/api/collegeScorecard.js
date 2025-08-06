const API_KEY = 'wvVabS9ofiPA3xCfYuFhAi4IR3ydRiJPxWq1pqKU';
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

class CollegeScorecard {
  async searchColleges(filters = {}) {
    try {
      const params = new URLSearchParams({
        api_key: API_KEY,
        per_page: 100,
        ...this.buildFilters(filters)
      });

      const response = await fetch(`${BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return this.processCollegeData(data.results);
    } catch (error) {
      console.error('College Scorecard API Error:', error);
      return [];
    }
  }

  buildFilters(filters) {
    const apiFilters = {};

    // Basic filters
    if (filters.state) {
      apiFilters['school.state'] = filters.state;
    }

    if (filters.minSize) {
      apiFilters['latest.student.size__range'] = `${filters.minSize}..`;
    }

    if (filters.maxSize) {
      const existing = apiFilters['latest.student.size__range'];
      apiFilters['latest.student.size__range'] = existing ? 
        existing.replace('..', `..${filters.maxSize}`) : 
        `..${filters.maxSize}`;
    }

    // SAT score filters
    if (filters.satScore) {
      // Look for colleges where the student's score is within or above the 25th percentile
      apiFilters['latest.admissions.sat_scores.25th_percentile.critical_reading__range'] = `..${filters.satScore}`;
    }

    // Admission rate filter (optional - for more realistic matches)
    if (filters.maxAdmissionRate) {
      apiFilters['latest.admissions.admission_rate.overall__range'] = `..${filters.maxAdmissionRate}`;
    }

    // Only include active, degree-granting institutions
    apiFilters['school.operating'] = 1;
    apiFilters['school.degrees_awarded.predominant__range'] = '2..4'; // Associates, Bachelors, Graduate

    // Request specific fields to optimize response size
    apiFilters.fields = [
      'id',
      'school.name',
      'school.state',
      'school.city',
      'school.school_url',
      'latest.student.size',
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.25th_percentile.critical_reading',
      'latest.admissions.sat_scores.75th_percentile.critical_reading',
      'latest.admissions.sat_scores.25th_percentile.math',
      'latest.admissions.sat_scores.75th_percentile.math',
      'latest.cost.tuition.in_state',
      'latest.cost.tuition.out_of_state',
      'latest.completion.completion_rate_4yr_100nt',
      'school.carnegie_basic',
      'school.locale'
    ].join(',');

    return apiFilters;
  }

  processCollegeData(rawData) {
    return rawData
      .filter(college => this.isValidCollege(college))
      .map(college => ({
        id: college.id,
        name: college['school.name'],
        state: college['school.state'],
        city: college['school.city'],
        website: college['school.school_url'],
        size: college['latest.student.size'],
        admissionRate: college['latest.admissions.admission_rate.overall'],
        satReading25: college['latest.admissions.sat_scores.25th_percentile.critical_reading'],
        satReading75: college['latest.admissions.sat_scores.75th_percentile.critical_reading'],
        satMath25: college['latest.admissions.sat_scores.25th_percentile.math'],
        satMath75: college['latest.admissions.sat_scores.75th_percentile.math'],
        tuitionInState: college['latest.cost.tuition.in_state'],
        tuitionOutOfState: college['latest.cost.tuition.out_of_state'],
        graduationRate: college['latest.completion.completion_rate_4yr_100nt'],
        type: this.getSchoolType(college['school.carnegie_basic']),
        setting: this.getSchoolSetting(college['school.locale'])
      }))
      .sort((a, b) => {
        // Sort by admission rate (more selective first) then by name
        if (a.admissionRate && b.admissionRate) {
          return a.admissionRate - b.admissionRate;
        }
        return a.name.localeCompare(b.name);
      });
  }

  isValidCollege(college) {
    return (
      college['school.name'] && 
      college['school.state'] &&
      college['latest.student.size'] > 0 &&
      (college['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 
       college['latest.admissions.sat_scores.25th_percentile.math'])
    );
  }

  getSchoolType(carnegieCode) {
    const types = {
      15: 'Research University',
      16: 'Research University', 
      17: 'Research University',
      18: 'Master\'s University',
      19: 'Master\'s University',
      20: 'Master\'s University',
      21: 'Liberal Arts College',
      22: 'Liberal Arts College',
      23: 'Liberal Arts College'
    };
    return types[carnegieCode] || 'University';
  }

  getSchoolSetting(localeCode) {
    if (localeCode >= 11 && localeCode <= 13) return 'Urban';
    if (localeCode >= 21 && localeCode <= 23) return 'Suburban';
    if (localeCode >= 31 && localeCode <= 33) return 'Small Town';
    if (localeCode >= 41 && localeCode <= 43) return 'Rural';
    return 'Unknown';
  }

  calculateMatchLevel(userSatScore, college) {
    // Calculate total SAT score for comparison (assuming roughly equal R&W and Math)
    const readingWritingScore = Math.floor(userSatScore / 2);
    const mathScore = userSatScore - readingWritingScore;

    const college25thTotal = (college.satReading25 || 0) + (college.satMath25 || 0);
    const college75thTotal = (college.satReading75 || 0) + (college.satMath75 || 0);

    if (!college25thTotal || !college75thTotal) {
      return 'Unknown';
    }

    if (userSatScore >= college75thTotal) {
      return 'Safety';
    } else if (userSatScore >= college25thTotal) {
      return 'Match';
    } else {
      return 'Reach';
    }
  }

  async getCollegeRecommendations(satScore, filters = {}) {
    const colleges = await this.searchColleges({
      ...filters,
      satScore
    });

    return colleges.map(college => ({
      ...college,
      matchLevel: this.calculateMatchLevel(satScore, college),
      avgSatScore: (college.satReading25 + college.satReading75 + college.satMath25 + college.satMath75) / 4
    }));
  }
}

export default new CollegeScorecard(); 