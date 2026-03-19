import { fetchUserRankings, refreshUserStatsCache } from '../api/profileClient';
import { getUserRankings, updateUserStatsCache } from '../firebase/rankingServices';

jest.mock('../api/profileClient', () => ({
  fetchUserRankings: jest.fn(),
  refreshUserStatsCache: jest.fn(),
}));

describe('ranking services', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    fetchUserRankings.mockReset();
    refreshUserStatsCache.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('refreshes cached stats through the profile API', async () => {
    refreshUserStatsCache.mockResolvedValue({
      stats: {
        userId: 'user-123',
        totalQuestions: 12,
        accuracy: 75,
      },
    });

    await expect(updateUserStatsCache('user-123')).resolves.toEqual({
      userId: 'user-123',
      totalQuestions: 12,
      accuracy: 75,
    });
    expect(refreshUserStatsCache).toHaveBeenCalledWith('user-123');
  });

  it('returns ranking data from the backend profile API', async () => {
    fetchUserRankings.mockResolvedValue({
      rankings: {
        questionsRanking: { percentile: 80, position: 2, total: 10 },
        accuracyRanking: { percentile: 70, position: 3, total: 10 },
      },
    });

    await expect(getUserRankings('user-123')).resolves.toEqual({
      questionsRanking: { percentile: 80, position: 2, total: 10 },
      accuracyRanking: { percentile: 70, position: 3, total: 10 },
    });
    expect(fetchUserRankings).toHaveBeenCalledWith('user-123');
  });

  it('falls back to empty rankings when the profile API fails', async () => {
    fetchUserRankings.mockRejectedValue(new Error('network'));

    await expect(getUserRankings('user-123')).resolves.toEqual({
      questionsRanking: { percentile: 0, position: 0, total: 0 },
      accuracyRanking: { percentile: 0, position: 0, total: 0 },
    });
  });
});
