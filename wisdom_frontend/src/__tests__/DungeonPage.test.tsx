import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DungeonPage from "@/app/dungeon/[id]/page";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Mock dependencies
jest.mock("@/context/AuthContext");
jest.mock("@/services/api");
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("@/components/MathRenderer", () => ({
  __esModule: true,
  default: ({ tex }: { tex: string }) => <div data-testid="math">{tex}</div>,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;
const mockUseParams = useParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;

describe("DungeonPage HUD v2", () => {
  const mockUser = { uid: "123", email: "test@test.com" };
  const mockRefreshProfile = jest.fn();
  
  const baseProfile = {
    user: { username: "tester" },
    hp: 3, max_hp: 3, level: 1, xp: 0, gold: 0,
    streak_count: 0,
    total_normal_dungeons_completed: 0,
    total_elite_dungeons_completed: 0,
    theme_color: "amber", font_size: "medium"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: baseProfile,
      loading: false,
      refreshProfile: mockRefreshProfile,
    });
    mockUseParams.mockReturnValue({ id: "algebra_basica" });
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseSearchParams.mockReturnValue({ get: jest.fn().mockReturnValue("normal") });
    
    // Mock dungeon current response
    mockApi.get.mockResolvedValue({
      data: {
        current_dungeon: { id: 1, title: "Algebra Semanal" },
        room: { order: 1 },
        question_index: 0,
        question: {
          enunciado: "Quanto é 2+2?",
          opcoes: ["4", "5"],
          hash: "h1",
        }
      }
    });
  });

  it("exibe o cronômetro, combo, barra de progresso e vidas", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: baseProfile,
      loading: false,
      refreshProfile: mockRefreshProfile,
    });
    
    render(<DungeonPage />);

    // Espera o carregamento da questão
    await waitFor(() => {
      expect(screen.getByText(/Quanto é 2\+2\?/)).toBeInTheDocument();
    });

    // HUD Elements
    expect(screen.getByText(/Combo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tempo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sala 1\/10/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vidas/i)).toBeInTheDocument();
    
    // Progress bar should exist
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  it("exibe a resposta correta em caso de erro", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: baseProfile,
      loading: false,
      refreshProfile: mockRefreshProfile,
    });

    mockApi.post.mockResolvedValue({
      data: {
        is_correct: false,
        correct_answer: "4",
        xp_gained: 0,
        gold_gained: 0,
        room_completed: false,
        dungeon_completed: false
      }
    });

    render(<DungeonPage />);
    
    await waitFor(() => screen.getByText(/5/));
    fireEvent.click(screen.getByText(/5/));
    fireEvent.click(screen.getByText(/Enviar Resposta/i));

    await waitFor(() => {
      expect(screen.getByText(/Resposta correta:/i)).toBeInTheDocument();
      expect(screen.getByText(/4/)).toBeInTheDocument();
    });
  });

  it("atualiza o combo após acerto", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: baseProfile,
      loading: false,
      refreshProfile: mockRefreshProfile,
    });
    
    mockApi.post.mockResolvedValue({
      data: {
        is_correct: true,
        xp_gained: 10,
        gold_gained: 5,
        room_completed: false,
        dungeon_completed: false
      }
    });

    render(<DungeonPage />);
    
    await waitFor(() => screen.getByText(/4/));
    fireEvent.click(screen.getByText(/4/));
    fireEvent.click(screen.getByText(/Enviar Resposta/i));

    await waitFor(() => {
      expect(screen.getByText(/Excelente!/i)).toBeInTheDocument();
    });

    // Check combo in HUD
    expect(screen.getByText(/Combo: 1/i)).toBeInTheDocument();
  });
});
