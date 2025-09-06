
import React from 'react';
import { PropertyDetails } from '../../types';
import { LogoDisplay } from '../ui/PredefinedLogos';
import Icon from '../ui/Icon';

interface PropertyIconProps {
  details: PropertyDetails;
  className?: string;
}

const PropertyIcon: React.FC<PropertyIconProps> = ({ details, className }) => {
  if (details.customLogo) {
    return (
      <img
        src={details.customLogo}
        alt="Custom Property Logo"
        className={className}
        style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
        }}
      />
    );
  }

  if (details.logoUrl) {
    return (
      <LogoDisplay logoKey={details.logoUrl} className={className} />
    );
  }

  return <Icon name="property" className={className} />;
};

export default PropertyIcon;