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
    is_following: false,
    streak_count: 7,
    total_normal_dungeons_completed: 12,
    total_elite_dungeons_completed: 3
  };

  const mockMasteryData = [
    { topic: 'Álgebra Básica', topic_id: 'algebra_basica', total_solved: 50, success_rate: 90, mastery: 450 },
    { topic: 'Cálculo Básico', topic_id: 'calculo_basico', total_solved: 30, success_rate: 80, mastery: 240 },
    { topic: 'Geometria', topic_id: 'geometria', total_solved: 20, success_rate: 70, mastery: 140 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ username: 'targetuser' });
    // Default implementation for API
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/mastery/')) return Promise.resolve({ data: mockMasteryData });
      return Promise.resolve({ data: mockProfileData });
    });
  });

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: true });
    render(<ProfilePage />);
    expect(screen.getByText(/Consultando oráculos/i)).toBeInTheDocument();
  });

  it('displays user profile data, mastery and engagement stats', async () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: false });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('targetuser')).toBeInTheDocument();
      
      // Top 3 Mastery
      expect(screen.getByText('Álgebra Básica')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
      expect(screen.getByText('Cálculo Básico')).toBeInTheDocument();
      expect(screen.getByText('240')).toBeInTheDocument();
      expect(screen.getByText('Geometria')).toBeInTheDocument();
      expect(screen.getByText('140')).toBeInTheDocument();
      
      // Engagement Stats
      expect(screen.getByText('7 Dias')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // normal
      expect(screen.getByText('3')).toBeInTheDocument(); // elite
    });
  });

  it('shows follow button if not following and not owner', async () => {
    mockUseAuth.mockReturnValue({ 
      profile: { user: { username: 'otheruser' } }, 
      loading: false 
    });
    mockApi.get.mockImplementation((url) => {
       if (url.includes('/mastery/')) return Promise.resolve({ data: mockMasteryData });
       return Promise.resolve({ data: { ...mockProfileData, is_following: false } });
    });

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
    mockApi.get.mockImplementation((url) => {
       if (url.includes('/mastery/')) return Promise.resolve({ data: mockMasteryData });
       return Promise.resolve({ data: { ...mockProfileData, is_following: true } });
    });

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

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText(/Editar Perfil/i)).not.toBeInTheDocument();
    });
  });

  it('displays error if profile not found', async () => {
    mockUseAuth.mockReturnValue({ profile: null, loading: false });
    mockApi.get.mockImplementation((url) => {
        if (url.includes('/profile/')) {
            return Promise.reject({ response: { status: 404 } });
        }
        return Promise.resolve({ data: mockMasteryData });
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Aventureiro não encontrado/i)).toBeInTheDocument();
    });
  });
});
