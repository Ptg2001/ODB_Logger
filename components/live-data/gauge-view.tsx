"use client"

import React from 'react';

type GaugeViewProps = {
  parameters: Array<{
    param: string;
    value: number;
    status?: 'normal' | 'warning' | 'error';
  }>;
}

export function GaugeView({ parameters }: GaugeViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {parameters.map(({ param, value, status = 'normal' }) => {
        // Determine color based on parameter type and status
        let gaugeColor = "#3b82f6"; // Default blue
        
        if (status === 'warning') {
          gaugeColor = "#f59e0b"; // Warning amber
        } else if (status === 'error') {
          gaugeColor = "#ef4444"; // Error red
        } else {
          // Normal status - pick color based on parameter type
          if (param.includes("temp")) {
            gaugeColor = "#ef4444"; // Red for temperature
          } else if (param.includes("speed")) {
            gaugeColor = "#10b981"; // Green for speed
          } else if (param.includes("rpm")) {
            gaugeColor = "#f59e0b"; // Amber for RPM
          } else if (param.includes("load")) {
            gaugeColor = "#8b5cf6"; // Purple for load
          }
        }
        
        // Convert value to percentage for gauge display
        const gaugeValue = getGaugeValue(value, param);
        
        return (
          <div key={param} className="flex flex-col items-center p-3 border rounded-lg bg-white">
            <span className="text-sm font-medium mb-3 text-gray-800">
              {formatParamName(param)}
            </span>
            
            {/* Gauge visualization */}
            <div className="relative w-full h-[120px] flex items-center justify-center">
              {/* Gauge track */}
              <div 
                style={{
                  width: '120px',
                  height: '60px',
                  borderTopLeftRadius: '120px',
                  borderTopRightRadius: '120px',
                  border: '10px solid #e5e7eb',
                  borderBottom: 'none',
                  position: 'relative'
                }}
              >
                {/* Gauge fill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    height: `${gaugeValue}%`,
                    maxHeight: '60px',
                    background: gaugeColor,
                    borderTopLeftRadius: '120px',
                    borderTopRightRadius: '120px',
                    transition: 'height 0.5s ease-out'
                  }}
                />
              </div>
              
              {/* Center circle with value */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '0',
                  width: '50px',
                  height: '50px',
                  background: 'white',
                  borderRadius: '50%',
                  border: `2px solid ${gaugeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: gaugeColor
                }}>
                  {value}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  color: '#6b7280'
                }}>
                  {getUnitForParam(param)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper functions
function formatParamName(param: string): string {
  return param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getUnitForParam(param: string): string {
  if (param.includes('temp')) return '°C';
  if (param.includes('speed')) return 'km/h';
  if (param.includes('rpm')) return 'RPM';
  if (param.includes('load') || param.includes('level') || param.includes('position')) return '%';
  if (param.includes('voltage')) return 'V';
  if (param.includes('pressure')) return 'kPa';
  if (param.includes('maf')) return 'g/s';
  return '';
}

function getGaugeValue(value: number, param: string): number {
  // Convert value to a percentage for the gauge
  switch(param) {
    case 'coolant_temp':
      // For temperature: assuming range from -20 to 120
      return Math.max(0, Math.min(100, ((value + 20) / 140) * 100));
    case 'throttle_position':
    case 'engine_load':
    case 'fuel_level':
      // These are already percentages
      return value;
    case 'rpm':
      // For RPM: assuming max of 8000
      return Math.max(0, Math.min(100, (value / 8000) * 100));
    case 'speed':
      // For speed: assuming max of 220 km/h
      return Math.max(0, Math.min(100, (value / 220) * 100));
    case 'battery_voltage':
      // For battery voltage: 10-16V range
      return Math.max(0, Math.min(100, ((value - 10) / 6) * 100));
    case 'fuel_pressure':
      // For fuel pressure: 0-700 kPa range
      return Math.max(0, Math.min(100, (value / 700) * 100));
    case 'intake_pressure':
      // For intake pressure: 0-255 kPa range
      return Math.max(0, Math.min(100, (value / 255) * 100));
    case 'o2_voltage':
      // For O2 voltage: 0-1.5V range
      return Math.max(0, Math.min(100, (value / 1.5) * 100));
    case 'maf':
      // For MAF: 0-10 g/s range (typical)
      return Math.max(0, Math.min(100, (value / 10) * 100));
    default:
      // Generic normalization to 0-100 range
      return Math.max(0, Math.min(100, value));
  }
} 