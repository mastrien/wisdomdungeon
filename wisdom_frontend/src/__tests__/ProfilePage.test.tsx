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

describe('ProfilePage', () => {
  const mockProfileData = {
    user: {
      username: 'targetuser',
      email: 'target@test.com'
    },
    xp: 500,
    gold: 200,
    level: 5,
    bio: 'Sou um aventureiro',
    followers_count: 10,
    following_count: 5,
    is_following: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ username: 'targetuser' });
  });

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: true });
    render(<ProfilePage />);
    expect(screen.getByText(/Consultando oráculos/i)).toBeInTheDocument();
  });

  it('displays user profile data and follow stats', async () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: false });
    mockApi.get.mockResolvedValueOnce({ data: mockProfileData });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('targetuser')).toBeInTheDocument();
      expect(screen.getByText('500 XP')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('LVL 5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // followers
      expect(screen.getByText('Seguidores')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // following
      expect(screen.getByText('Seguindo')).toBeInTheDocument();
    });
  });

  it('shows follow button if not following and not owner', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'otheruser' } }, 
      loading: false 
    });
    mockApi.get.mockResolvedValueOnce({ data: { ...mockProfileData, is_following: false } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Seguir/i })).toBeInTheDocument();
    });
  });

  it('shows unfollow button if already following', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'otheruser' } }, 
      loading: false 
    });
    mockApi.get.mockResolvedValueOnce({ data: { ...mockProfileData, is_following: true } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Seguindo/i })).toBeInTheDocument();
    });
  });

  it('does not show follow button if owner', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'targetuser' } }, 
      loading: false 
    });
    mockApi.get.mockResolvedValueOnce({ data: { ...mockProfileData, is_following: false } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Seguir/i })).not.toBeInTheDocument();
    });
  });

  it('shows edit button if logged in as owner', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'targetuser' } }, 
      loading: false 
    });
    mockApi.get.mockResolvedValueOnce({ data: mockProfileData });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Editar Perfil/i)).toBeInTheDocument();
    });
  });

  it('does not show edit button if logged in as different user', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'otheruser' } }, 
      loading: false 
    });
    mockApi.get.mockResolvedValueOnce({ data: mockProfileData });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText(/Editar Perfil/i)).not.toBeInTheDocument();
    });
  });

  it('displays error if profile not found', async () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: false });
    mockApi.get.mockRejectedValueOnce({ 
      response: { status: 404 } 
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Aventureiro não encontrado/i)).toBeInTheDocument();
    });
  });
});
