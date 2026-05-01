import { render, screen, waitFor } from '@testing-library/react';
import DungeonPage from '@/app/dungeon/[id]/page';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

// Mocks
jest.mock('@/services/api');
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;

describe('DungeonPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseParams.mockReturnValue({ id: 'algebra_basica' });
  });

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<DungeonPage />);
    expect(screen.getByText(/Preparando desafio/i)).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<DungeonPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('fetches and displays question if authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' }, loading: false });
    const mockQuestion = {
      enunciado: 'Resolva x + 2 = 5',
      opcoes: ['1', '2', '3', '4'],
      resposta_correta: '3',
      hash: 'abc'
    };
    mockApi.get.mockResolvedValueOnce({ data: mockQuestion });

    render(<DungeonPage />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestion.enunciado)).toBeInTheDocument();
    });
    
    mockQuestion.opcoes.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });
});
