import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Loader2 } from 'lucide-react';
import { ClientInfo } from '../types';

interface CheckoutFormProps {
  onSubmit: (data: ClientInfo) => void;
  isLoading: boolean;
  onCityChange?: (city: string) => void;
  defaultCity?: string;
}

const MOROCCO_CITIES = [
  'Agadir',
  'Al Hoceima',
  'Beni Mellal',
  'Berkane',
  'Casablanca',
  'Dakhla',
  'El Jadida',
  'Errachidia',
  'Essaouira',
  'Fès',
  'Guelmim',
  'Kenitra',
  'Khemisset',
  'Khouribga',
  'Laayoune',
  'Larache',
  'Marrakech',
  'Meknès',
  'Mohammedia',
  'Nador',
  'Ouarzazate',
  'Oujda',
  'Rabat',
  'Safi',
  'Settat',
  'Sidi Kacem',
  'Tanger',
  'Taroudant',
  'Taza',
  'Tétouan',
];

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading, onCityChange, defaultCity }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientInfo>({
    defaultValues: {
      city: defaultCity ?? '',
    } as Partial<ClientInfo>,
  });

  const cityValue = watch('city');

  useEffect(() => {
    onCityChange?.(cityValue || '');
  }, [cityValue, onCityChange]);

  const onFormSubmit = (data: ClientInfo) => {
    const trimmedData = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
    };
    onSubmit(trimmedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">
            Ville <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <select
              id="city"
              disabled={isLoading}
              {...register('city', {
                required: 'La ville est obligatoire',
              })}
              className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-4 transition-all appearance-none ${
                errors.city
                  ? 'border-red-200 focus:ring-red-500/10 bg-red-50/30'
                  : 'border-gray-100 focus:ring-primary/10 focus:bg-white focus:border-primary/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Choisir une ville</option>
              {MOROCCO_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          {errors.city && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-red-500 uppercase px-4"
            >
              {errors.city.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">
            Nom Complet <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              id="name"
              disabled={isLoading}
              {...register('name', {
                required: 'Le nom est obligatoire',
                minLength: {
                  value: 2,
                  message: 'Le nom doit contenir au moins 2 caractères',
                },
              })}
              className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-4 transition-all ${
                errors.name
                  ? 'border-red-200 focus:ring-red-500/10 bg-red-50/30'
                  : 'border-gray-100 focus:ring-primary/10 focus:bg-white focus:border-primary/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Ex: Hamid El Amrani"
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-red-500 uppercase px-4"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="tel"
              id="phone"
              disabled={isLoading}
              {...register('phone', {
                required: 'Le numéro est obligatoire',
                pattern: {
                  value: /^\s*[0-9]{8,12}\s*$/,
                  message: 'Le numéro doit contenir entre 8 et 12 chiffres',
                },
              })}
              className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-4 transition-all ${
                errors.phone
                  ? 'border-red-200 focus:ring-red-500/10 bg-red-50/30'
                  : 'border-gray-100 focus:ring-primary/10 focus:bg-white focus:border-primary/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Ex: 0612345678"
            />
          </div>
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-red-500 uppercase px-4"
            >
              {errors.phone.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-black text-gray-700 uppercase tracking-wider px-1">
            Adresse de Livraison <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <textarea
              id="address"
              rows={4}
              disabled={isLoading}
              {...register('address', {
                required: "L'adresse est obligatoire",
                minLength: {
                  value: 10,
                  message: "L'adresse doit être plus précise (min 10 car.)",
                },
              })}
              className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-4 transition-all resize-none ${
                errors.address
                  ? 'border-red-200 focus:ring-red-500/10 bg-red-50/30'
                  : 'border-gray-100 focus:ring-primary/10 focus:bg-white focus:border-primary/20'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Votre adresse complète, ville, quartier..."
            />
          </div>
          {errors.address && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-red-500 uppercase px-4"
            >
              {errors.address.message}
            </motion.p>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
          isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Traitement...
          </>
        ) : (
          'Confirmer la commande'
        )}
      </motion.button>
    </form>
  );
};
