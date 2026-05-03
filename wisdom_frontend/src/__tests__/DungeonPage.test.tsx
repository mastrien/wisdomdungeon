import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DungeonPage from "@/app/dungeon/[id]/page";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";

// Mock dependencies
jest.mock("@/context/AuthContext");
jest.mock("@/services/api");
jest.mock("next/navigation");
jest.mock("@/components/MathRenderer", () => ({
  __esModule: true,
  default: ({ tex }: { tex: string }) => <div data-testid="math">{tex}</div>,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;
const mockUseParams = useParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe("DungeonPage HUD v2", () => {
  const mockUser = { uid: "123", email: "test@test.com" };
  const mockRefreshProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      refreshProfile: mockRefreshProfile,
    });
    mockUseParams.mockReturnValue({ id: "algebra_basica" });
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    
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

  it("exibe o cronômetro, o combo e a barra de progresso", async () => {
    render(<DungeonPage />);

    // Espera o carregamento da questão
    await waitFor(() => {
      expect(screen.getByText(/Quanto é 2\+2\?/)).toBeInTheDocument();
    });

    // HUD Elements
    expect(screen.getByText(/Combo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tempo:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sala 1\/10/i)).toBeInTheDocument();
    
    // Progress bar should exist
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  it("atualiza o combo após acerto", async () => {
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

    // Check combo in HUD (implementation detail: how it's stored/displayed)
    // Assuming it shows "Combo: 1"
    expect(screen.getByText(/Combo: 1/i)).toBeInTheDocument();
  });
});
