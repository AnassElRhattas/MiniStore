import React from 'react';
import { useForm } from 'react-hook-form';
import { ClientInfo } from '../types';

interface CheckoutFormProps {
  onSubmit: (data: ClientInfo) => void;
  isLoading: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInfo>();

  const onFormSubmit = (data: ClientInfo) => {
    // Trim whitespace from form data
    const trimmedData = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
    };
    onSubmit(trimmedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          disabled={isLoading}
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          disabled={isLoading}
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^\s*[0-9]{8,12}\s*$/,
              message: 'Phone number must be 8-12 digits',
            },
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Address *
        </label>
        <textarea
          id="address"
          rows={3}
          disabled={isLoading}
          {...register('address', {
            required: 'Address is required',
            minLength: {
              value: 10,
              message: 'Address must be at least 10 characters',
            },
          })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Enter your complete delivery address"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          isLoading
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Processing Order...' : 'Place Order'}
      </button>
    </form>
  );
};