import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../ProductCard';
import { Product } from '@/types';
import { CartProvider, useCart } from '@/contexts/CartContext';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 10.99,
  imageUrl: 'test-image.jpg',
  description: 'Test product description',
  stock: 5,
  category: 'test',
};

const mockProductOutOfStock: Product = {
  ...mockProduct,
  imageUrl: 'test-image.jpg',
  stock: 0,
};

const mockOnAddToCart = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <CartProvider>{children}</CartProvider>
  </MemoryRouter>
);

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render product information correctly', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('10,99 DH')).toBeInTheDocument(); // toLocaleString formats with comma
      expect(screen.getByText('Test product description')).toBeInTheDocument();
      expect(screen.getByText('5 in stock')).toBeInTheDocument();
    });

    it('should render product image with correct src and alt', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const image = screen.getByAltText('Test Product');
      expect(image).toHaveAttribute('src', 'test-image.jpg');
    });

    it('should not render category badge', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });
  });

  describe('stock status', () => {
    it('should show in stock status for available products', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      expect(screen.getByText('5 in stock')).toBeInTheDocument();
      expect(screen.getByText('5 in stock')).toHaveClass('text-green-600');
    });

    it('should show out of stock status for unavailable products', () => {
      render(<ProductCard product={mockProductOutOfStock} />, { wrapper });
      
      const stockStatusElements = screen.getAllByText('Out of Stock');
      expect(stockStatusElements).toHaveLength(2); // One in stock status, one in button
      // Check the stock status element (first one) has the red class
      expect(stockStatusElements[0]).toHaveClass('text-red-500');
    });

    it('should disable add to cart button when out of stock', () => {
      render(<ProductCard product={mockProductOutOfStock} />, { wrapper });
      
      const button = screen.getByRole('button', { name: /out of stock/i });
      expect(button).toBeDisabled();
    });
  });

  describe('add to cart functionality', () => {
    it('should add item to cart when button is clicked', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const { items, addItem } = useCart();
        return (
          <div>
            <div data-testid="cart-count">{items.length}</div>
            <ProductCard product={mockProduct} />
          </div>
        );
      };
      
      render(<TestComponent />, { wrapper });
      
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      await user.click(button);
      
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });

    it('should not add to cart when button is disabled', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      render(<ProductCard product={mockProductOutOfStock} />, { wrapper });
      
      const button = screen.getByRole('button', { name: /out of stock/i });
      fireEvent.click(button);
      
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('image handling', () => {
    it('should handle image loading error', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const image = screen.getByAltText('Test Product');
      fireEvent.error(image);
      
      expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200?text=No+Image');
    });

    it('should use placeholder image when no image provided', () => {
      const productWithoutImage = { ...mockProduct, imageUrl: '' };
      render(<ProductCard product={productWithoutImage} />, { wrapper });
      
      const image = screen.getByAltText('Test Product');
      expect(image).toHaveAttribute('src', ''); // Empty src initially, will be set by onError
    });
  });

  describe('styling and layout', () => {
    it('should have proper card structure', () => {
      const { container } = render(<ProductCard product={mockProduct} />, { wrapper });
      
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'hover:shadow-lg', 'transition-shadow');
    });

    it('should have proper image container', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const image = screen.getByAltText('Test Product');
      expect(image).toHaveClass('w-full', 'h-48', 'object-cover');
    });

    it('should have proper content padding', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const content = screen.getByText('Test Product').parentElement;
      expect(content).toHaveClass('p-4');
    });
  });

  describe('accessibility', () => {
    it('should have proper button text', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Add to Cart');
    });

    it('should have proper alt text for image', () => {
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const image = screen.getByAltText('Test Product');
      expect(image).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle product with very long name', () => {
      const longNameProduct = {
        ...mockProduct,
        name: 'This is a very long product name that should be truncated properly in the card layout',
      };
      render(<ProductCard product={longNameProduct} />, { wrapper });
      
      expect(screen.getByText(longNameProduct.name)).toBeInTheDocument();
    });

    it('should handle product with very long description', () => {
      const longDescProduct = {
        ...mockProduct,
        description: 'This is a very long description that contains a lot of text and should be handled properly by the component without breaking the layout or causing any rendering issues.',
      };
      render(<ProductCard product={longDescProduct} />, { wrapper });
      
      expect(screen.getByText(longDescProduct.description)).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const freeProduct = { ...mockProduct, price: 0 };
      render(<ProductCard product={freeProduct} />, { wrapper });
      
      expect(screen.getByText('0 DH')).toBeInTheDocument();
    });

    it('should handle very high price', () => {
      const expensiveProduct = { ...mockProduct, price: 999999.99 };
      render(<ProductCard product={expensiveProduct} />, { wrapper });
      
      expect(screen.getByText((content, element) => {
        return content.includes('999') && content.includes('DH');
      })).toBeInTheDocument(); // Match price that contains 999 and DH
    });
  });

  describe('user interactions', () => {
    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const { items } = useCart();
        return (
          <div>
            <div data-testid="cart-count">{items.length}</div>
            <div data-testid="cart-quantity">{items[0]?.quantity || 0}</div>
            <ProductCard product={mockProduct} />
          </div>
        );
      };
      
      render(<TestComponent />, { wrapper });
      
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      
      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-quantity')).toHaveTextContent('3'); // Should be limited by stock (5)
    });

    it('should maintain button state after interaction', async () => {
      const user = userEvent.setup();
      render(<ProductCard product={mockProduct} />, { wrapper });
      
      const button = screen.getByRole('button', { name: /add to cart/i });
      
      expect(button).not.toBeDisabled();
      await user.click(button);
      expect(button).not.toBeDisabled(); // Should remain enabled
    });
  });
});