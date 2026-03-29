import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from '../CheckoutForm';

const mockOnSubmit = vi.fn();

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form with all fields', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adresse de livraison/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmer la commande/i })).toBeInTheDocument();
    });

    it('should render form with proper styling', () => {
      const { container } = render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-6');
    });
  });

  describe('form validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/la ville est obligatoire/i)).toBeInTheDocument();
        expect(screen.getByText(/le nom est obligatoire/i)).toBeInTheDocument();
        expect(screen.getByText(/le numéro est obligatoire/i)).toBeInTheDocument();
        expect(screen.getByText(/l'adresse est obligatoire/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate name minimum length', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/au moins 2 caractères/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/entre 8 et 12 chiffres/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate address minimum length', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      await user.type(addressInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/min 10/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid phone number formats', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '12345678');
      
      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'John Doe');
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/entre 8 et 12 chiffres/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const citySelect = screen.getByLabelText(/ville/i);
      await user.selectOptions(citySelect, 'El Jadida');

      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: '123 Main Street, City, Country',
          city: 'El Jadida',
        });
      });
    });

    it('should trim whitespace from inputs', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const citySelect = screen.getByLabelText(/ville/i);
      await user.selectOptions(citySelect, 'El Jadida');

      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, '  John Doe  ');
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '  12345678  ');
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      await user.type(addressInput, '  123 Main Street  ');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: '123 Main Street',
          city: 'El Jadida',
        });
      });
    });
  });

  describe('loading state', () => {
    it('should disable form when loading', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByLabelText(/ville/i)).toBeDisabled();
      expect(screen.getByLabelText(/nom complet/i)).toBeDisabled();
      expect(screen.getByLabelText(/téléphone/i)).toBeDisabled();
      expect(screen.getByLabelText(/adresse de livraison/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /traitement/i })).toBeDisabled();
    });

    it('should show loading text on button when loading', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByRole('button')).toHaveTextContent(/traitement/i);
    });

    it('should have proper styling for loading button', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });
  });

  describe('normal state styling', () => {
    it('should have proper styling for normal button', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const button = screen.getByRole('button', { name: /confirmer la commande/i });
      expect(button).toHaveClass('bg-primary', 'text-white', 'hover:bg-primary/90');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adresse de livraison/i)).toBeInTheDocument();
    });

    it('should have proper placeholder text', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByPlaceholderText(/hamid el amrani/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ex:\s*06/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/adresse complète/i)).toBeInTheDocument();
    });
  });

  describe('error styling', () => {
    it('should show error styling for invalid fields', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-red-200');
      });
    });

    it('should show error messages with proper styling', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/au moins 2 caractères/i);
        expect(errorMessage).toHaveClass('text-[10px]', 'font-black', 'text-red-500', 'uppercase', 'px-4');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);

      const citySelect = screen.getByLabelText(/ville/i);
      await user.selectOptions(citySelect, 'El Jadida');
      
      const nameInput = screen.getByLabelText(/nom complet/i);
      const longName = 'A'.repeat(100);
      await user.type(nameInput, longName);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: longName,
          phone: '12345678',
          address: '123 Main Street, City, Country',
          city: 'El Jadida',
        });
      });
    });

    it('should handle special characters in address', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const citySelect = screen.getByLabelText(/ville/i);
      await user.selectOptions(citySelect, 'El Jadida');

      const nameInput = screen.getByLabelText(/nom complet/i);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/adresse de livraison/i);
      const specialAddress = '123 Main St, Apt #4, City - State, ZIP 12345';
      await user.type(addressInput, specialAddress);
      
      const submitButton = screen.getByRole('button', { name: /confirmer la commande/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: specialAddress,
          city: 'El Jadida',
        });
      });
    });
  });
});
