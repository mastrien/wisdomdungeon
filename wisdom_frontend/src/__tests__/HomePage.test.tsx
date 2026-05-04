import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useRouter } from "next/navigation";

// Mock dependencies
jest.mock("@/context/AuthContext");
jest.mock("@/services/api");
jest.mock("next/navigation");

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;
const mockUseRouter = useRouter as jest.Mock;

describe("HomePage", () => {
  const mockUser = { uid: "123", email: "test@test.com" };
  const mockProfile = {
    user: { username: "explorer", email: "test@test.com" },
    streak_count: 5,
    total_normal_dungeons_completed: 2,
    total_elite_dungeons_completed: 1,
    xp: 100,
    gold: 50,
    level: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
    });
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    
    mockApi.get.mockImplementation((url) => {
      if (url === "/mastery/?today=true") return Promise.resolve({ data: [] });
      if (url === "/dungeons/") return Promise.resolve({ data: [] });
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renderiza a página inicial e tenta exibir os contadores de masmorra", async () => {
    // Este teste deve falhar se ShieldAlert não estiver definido nas importações
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Mundo da Matemática/i)).toBeInTheDocument();
    });

    // Se o componente quebrar devido ao ShieldAlert, o teste falhará antes ou aqui
    expect(screen.getByText(/Elite/i)).toBeInTheDocument();
  });
});
