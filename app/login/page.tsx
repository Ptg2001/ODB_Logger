"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, CarIcon, GaugeIcon, WifiIcon, AlertTriangleIcon, CheckCircleIcon, ActivityIcon } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [diagnosticStep, setDiagnosticStep] = useState(0)
  const [signingIn, setSigningIn] = useState(false)
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})
  const [touchedFields, setTouchedFields] = useState<{email?: boolean; password?: boolean}>({})
  const { login, loading } = useAuth()

  // Animation and initialization
  useEffect(() => {
    setLoaded(true);
    
    // Diagnostic initialization sequence
    const diagnosticInterval = setInterval(() => {
      setDiagnosticStep(prev => (prev + 1) % 4);
    }, 2000);
    
    return () => {
      clearInterval(diagnosticInterval);
    };
  }, []);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Validate password
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Validate form on input change
  useEffect(() => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (touchedFields.email) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
    }
    
    if (touchedFields.password) {
      const passwordError = validatePassword(password);
      if (passwordError) newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
  }, [email, password, touchedFields]);

  // Handle field blur for validation
  const handleBlur = (field: 'email' | 'password') => {
    setTouchedFields({...touchedFields, [field]: true});
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    
    // Mark field as touched on first change
    if (!touchedFields[field]) {
      setTouchedFields({...touchedFields, [field]: true});
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields on submission
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    // Update touched status for all fields
    setTouchedFields({email: true, password: true});
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }
    
    // Clear errors if validation passes
    setErrors({});
    setSigningIn(true);
    
    // Short delay before redirecting to show the animation
    setTimeout(async () => {
      try {
        await login(email, password);
        // The redirect will be handled by the auth provider
      } catch (error) {
        setSigningIn(false);
        setErrors({
          email: "Login failed. Please check your credentials."
        });
      }
    }, 2500);
  }, [email, password, login]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Diagnostic status messages
  const diagnosticMessages = [
    { icon: WifiIcon, message: "Initializing OBD connection...", color: "text-yellow-500" },
    { icon: AlertTriangleIcon, message: "Scanning diagnostic modules...", color: "text-orange-500" },
    { icon: CarIcon, message: "Reading vehicle parameters...", color: "text-blue-500" },
    { icon: CheckCircleIcon, message: "System ready", color: "text-green-500" }
  ];

  const currentDiagnostic = diagnosticMessages[diagnosticStep];

  // Dashboard loading diagnostic messages
  const dashboardLoadMessages = [
    "Establishing vehicle connection...",
    "Retrieving ECU data...",
    "Loading diagnostic modules...",
    "Analyzing sensor data...",
    "Preparing dashboard interface..."
  ];

  const isFormValid = !errors.email && !errors.password && email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden px-3 sm:px-4 py-6">
      {/* Fixed Background Image - Car dashboard with OBD theme */}
      <div 
        className="fixed inset-0 w-full h-full z-0 opacity-65" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=2070')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      ></div>
      
      {/* Colored overlay for better contrast - reduced opacity */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-blue-900/30 to-blue-900/40 z-0"></div>
      
      {/* Digital circuit pattern overlay */}
      <div className="fixed inset-0 z-0 opacity-10 circuit-pattern"></div>
      
      {/* Edge animation - circulating border */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <div className="edge-animation-top"></div>
        <div className="edge-animation-right"></div>
        <div className="edge-animation-bottom"></div>
        <div className="edge-animation-left"></div>
      </div>
      
      {/* Full-screen loading overlay for dashboard transition */}
      {signingIn && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-4">
          <div className="car-diagnostic-animation">
            <div className="car-silhouette"></div>
            <div className="scanner-beam"></div>
            <div className="scanner-points">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="scan-point" style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          </div>
          
          <div className="dashboard-loading mt-6 text-white">
            <div className="flex flex-col items-center">
              <div className="loading-message mb-2 text-center h-6 relative w-full">
                {dashboardLoadMessages.map((msg, i) => (
                  <div key={i} 
                       className={`transition-opacity duration-300 absolute w-full left-0
                                 ${Math.floor((Date.now() / 1000) % 5) === i ? 'opacity-100' : 'opacity-0'}`}>
                    {msg}
                  </div>
                ))}
              </div>
              <div className="loading-progress w-full max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="loading-progress-bar h-full bg-gradient-to-r from-blue-500 to-green-400"></div>
              </div>
              <div className="monitoring-grid mt-4 grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="monitor-item flex items-center gap-1">
                    <ActivityIcon className="h-3 w-3 text-blue-400" />
                    <div className="monitor-data text-xs text-gray-400">
                      SENSOR-{i+1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Logo with pulsing animation */}
      <div className={`relative z-10 flex justify-center mb-3 ${loaded ? 'animate-fadeIn' : ''}`}>
        <div className="bg-white rounded-full p-3 shadow-xl relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
          <div className="absolute inset-0 rounded-full digital-ring"></div>
          <Image 
            src="/assets/obd-logo.svg" 
            alt="OBD-II Logger" 
            width={45}
            height={45}
            sizes="(max-width: 640px) 45px, 50px"
            priority
            className="relative z-10 w-[45px] h-[45px] sm:w-[50px] sm:h-[50px]"
          />
        </div>
      </div>
      
      {/* Diagnostic status indicator */}
      <div className="relative z-10 flex items-center justify-center mb-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] sm:text-xs animate-pulse">
        <currentDiagnostic.icon className={`h-3 w-3 mr-1.5 ${currentDiagnostic.color}`} />
        <span className="diagnostic-text">{currentDiagnostic.message}</span>
      </div>
      
      {/* Login Card with slide-in animation and rounder corners */}
      <Card className={`w-full max-w-[320px] sm:max-w-sm mx-auto relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-md rounded-xl overflow-hidden ${loaded ? 'animate-slideUp' : 'opacity-0'}`}>
        {/* Animated connection points */}
        <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-blue-500 animate-blink"></div>
        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 animate-blink" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-yellow-500 animate-blink" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-blink" style={{animationDelay: '1.5s'}}></div>
        
        <CardHeader className="text-center pb-2 pt-3 sm:pb-3 sm:pt-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg sm:text-xl text-blue-800">OBD-II Logger</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-blue-500">Automotive Diagnostic Interface</CardDescription>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`pl-8 text-sm h-9 sm:h-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && (
                <div className="flex items-center text-red-500 text-[10px] sm:text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`pl-8 pr-9 text-sm h-9 sm:h-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center text-red-500 text-[10px] sm:text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <span className="mr-2">Connecting</span>
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-center px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            OBD-II Logger System v4.2.1
          </p>
        </CardFooter>
      </Card>
      
      <div className="mt-3 text-center text-white/70 text-[10px] sm:text-xs relative z-10">
        © {new Date().getFullYear()} OBD-II Logger · All rights reserved
      </div>
    </div>
  )
}

