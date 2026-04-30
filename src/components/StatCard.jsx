import React from 'react';
import PropTypes from 'prop-types';

/**
 * Admin dashboard statistic card component.
 * Displays a label, numeric value, and optional icon/color.
 * Used on AdminDashboard for total posts, total users, admin count, user count.
 * @param {{ label: string, value: number, icon?: React.ReactNode, color?: string }} props
 */
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    accent: 'bg-accent-50 text-accent-700 border-accent-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    surface: 'bg-surface-50 text-surface-700 border-surface-200',
  };

  const resolvedColor = colorClasses[color] || colorClasses.primary;

  return (
    <div
      className={`rounded-lg border p-5 flex items-center space-x-4 shadow-sm transition-shadow hover:shadow-md ${resolvedColor}`}
    >
      {icon && (
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-60 text-2xl">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-tight">{value}</span>
        <span className="text-sm font-medium opacity-80">{label}</span>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf([
    'primary',
    'accent',
    'green',
    'red',
    'blue',
    'violet',
    'surface',
  ]),
};

StatCard.defaultProps = {
  icon: null,
  color: 'primary',
};

export default StatCard;