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
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
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
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate name minimum length', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/phone number must be 8-12 digits/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate address minimum length', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      await user.type(addressInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/address must be at least 10 characters/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid phone number formats', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '12345678');
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/phone number must be 8-12 digits/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: '123 Main Street, City, Country',
        });
      });
    });

    it('should trim whitespace from inputs', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, '  John Doe  ');
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '  12345678  ');
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      await user.type(addressInput, '  123 Main Street  ');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: '123 Main Street',
        });
      });
    });
  });

  describe('loading state', () => {
    it('should disable form when loading', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByLabelText(/full name/i)).toBeDisabled();
      expect(screen.getByLabelText(/phone number/i)).toBeDisabled();
      expect(screen.getByLabelText(/delivery address/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /processing order/i })).toBeDisabled();
    });

    it('should show loading text on button when loading', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByRole('button')).toHaveTextContent(/processing order/i);
    });

    it('should have proper styling for loading button', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-400', 'text-gray-200', 'cursor-not-allowed');
    });
  });

  describe('normal state styling', () => {
    it('should have proper styling for normal button', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const button = screen.getByRole('button', { name: /place order/i });
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
    });

    it('should have proper placeholder text', () => {
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your phone number/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your complete delivery address/i)).toBeInTheDocument();
    });
  });

  describe('error styling', () => {
    it('should show error styling for invalid fields', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-red-500');
      });
    });

    it('should show error messages with proper styling', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'J');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/name must be at least 2 characters/i);
        expect(errorMessage).toHaveClass('mt-1', 'text-sm', 'text-red-600');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long names', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const longName = 'A'.repeat(100);
      await user.type(nameInput, longName);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      await user.type(addressInput, '123 Main Street, City, Country');
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: longName,
          phone: '12345678',
          address: '123 Main Street, City, Country',
        });
      });
    });

    it('should handle special characters in address', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '12345678');
      
      const addressInput = screen.getByLabelText(/delivery address/i);
      const specialAddress = '123 Main St, Apt #4, City - State, ZIP 12345';
      await user.type(addressInput, specialAddress);
      
      const submitButton = screen.getByRole('button', { name: /place order/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          phone: '12345678',
          address: specialAddress,
        });
      });
    });
  });
});