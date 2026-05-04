import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

// Mock AuthContext
jest.mock('@/context/AuthContext');
const mockUseAuth = useAuth as jest.Mock;

describe('Header', () => {
  it('displays XP and Gold from the profile', () => {
    const mockProfile = {
      user: {
        username: 'testuser',
        email: 'test@test.com'
      },
      xp: 150,
      gold: 50,
      level: 3,
      theme_color: 'amber',
      font_size: 'medium'
    };
    
    mockUseAuth.mockReturnValue({
      user: { uid: '123' },
      profile: mockProfile,
      loading: false
    });

    render(<Header />);

    expect(screen.getByText('150 XP')).toBeInTheDocument();
    expect(screen.getByText('50 Ouro')).toBeInTheDocument();
    expect(screen.getByText('Nível 3')).toBeInTheDocument();
  });

  it('shows more options menu when clicking the menu button', () => {
    const mockProfile = {
      user: { username: 'testuser' },
      xp: 150, gold: 50, level: 3, theme_color: 'amber', font_size: 'medium'
    };
    mockUseAuth.mockReturnValue({ user: {}, profile: mockProfile, loading: false });

    render(<Header />);

    // Logout button should NOT be directly visible
    expect(screen.queryByTitle('Sair')).not.toBeInTheDocument();

    // Click the "More options" button
    const menuBtn = screen.getByLabelText('Mais opções');
    fireEvent.click(menuBtn);

    // Options should appear
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
