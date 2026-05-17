import { render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/profile/[username]/page';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

// Mocks
jest.mock('@/services/api');
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseParams = useParams as jest.Mock;

describe('Avatar Restriction', () => {
  const mockProfileData = {
    user: { username: 'targetuser', email: 'target@test.com' },
    xp: 500, gold: 200, level: 1, bio: '', followers_count: 0, following_count: 0,
    is_following: false, streak_count: 0, total_normal_dungeons_completed: 0,
    total_elite_dungeons_completed: 0, hp: 3, max_hp: 3, theme_color: 'amber',
    font_size: 'medium', avatar_url: null, next_level_xp: 100, current_level_xp_threshold: 0, metadata: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ username: 'targetuser' });
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/mastery/')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: mockProfileData });
    });
  });

  it('shows a locked icon/message if user is below level 5', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'targetuser' }, level: 1 }, 
      loading: false 
    });
    mockApi.get.mockImplementation((url) => {
        if (url.includes('/mastery/')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: { ...mockProfileData, level: 1 } });
    });

    render(<ProfilePage />);

    await waitFor(() => {
      // The button should either not exist or be disabled/show a lock
      // Let's assume we implement a button that shows "Nível 5 necessário" or similar
      expect(screen.getByText(/Nível 5/i)).toBeInTheDocument();
    });
  });

  it('allows avatar change if user is level 5 or above', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'targetuser' }, level: 5 }, 
      loading: false 
    });
    mockApi.get.mockImplementation((url) => {
        if (url.includes('/mastery/')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: { ...mockProfileData, level: 5 } });
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Alterar foto/i)).toBeInTheDocument();
    });
  });
});
