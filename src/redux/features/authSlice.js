import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import * as api from '../api';
import { toast } from 'react-toastify';

export const login = createAsyncThunk("/auth/login", async({formData, navigate, onSuccess}, { rejectWithValue })=>{
    try {
        const response = await api.signIn(formData);
        
        // Log the response data to check country code
        console.log("Login response data:", {
            result: response.data.result,
            countryCode: response.data.result?.countryCode,
            rawResponse: response.data
        });
        
        toast.success("Successfully logged in");
        
        // Ensure country code is properly stored
        const countryCode = response.data.result?.countryCode?.toLowerCase() || 'ba';
        const userData = {
            ...response.data,
            result: {
                ...response.data.result,
                countryCode: countryCode
            }
        };
        
        // Store the modified data
        localStorage.setItem("profile", JSON.stringify(userData));
        
        if (response.data.result && response.data.result.businessType) {
            console.log("Setting business type in session:", response.data.result.businessType);
            sessionStorage.setItem('businessType', response.data.result.businessType);
        } else if (response.data.businessType) {
            console.log("Setting business type in session from response root:", response.data.businessType);
            sessionStorage.setItem('businessType', response.data.businessType);
        }
        
        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(userData);
        }
        
        navigate("/dashboard");
        return userData;
    } catch (error) {
        const errorMessage = error.customMessage || error.response?.data?.message || "Greška prilikom prijave";
        return rejectWithValue({ message: errorMessage });
    }
});

export const registerCompany = createAsyncThunk("/auth/registerCompany", async({formData, toast, navigate}, { rejectWithValue })=>{
    try {
        console.log("Sending registration request with data:", formData);
        const response = await api.signUpCompany(formData);
        
        // Sačuvaj business type odmah pri registraciji
        if (formData.businessType) {
            sessionStorage.setItem('businessType', formData.businessType);
        }
        
        toast.success("Successfully registered");
        navigate("/auth?role=company&type=login");
        return response.data;
    } catch (error) {
        console.error("Registration error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        const errorMessage = error.response?.data?.message || error.message || "Error during registration";
        toast.error(errorMessage);
        return rejectWithValue(error.response?.data || { message: errorMessage });
    }
});

export const getUser = createAsyncThunk(
    "auth/getUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getUser();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const getCompany = createAsyncThunk(
    "auth/getCompany",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getCompany();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Dodajemo funkciju za proveru validnosti tokena
export const checkTokenExpiry = () => {
    const profile = localStorage.getItem('profile');
    if (!profile) return false;
    
    try {
        const parsedProfile = JSON.parse(profile);
        if (!parsedProfile.token) return false;
        
        // Check if token is expired
        const token = parsedProfile.token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        const expired = Date.now() >= exp * 1000;
        
        if (expired) {
            // Clear storage on expiration
            localStorage.removeItem('profile');
            localStorage.removeItem('token');
            localStorage.removeItem('lastActive');
            sessionStorage.clear();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Error checking token expiry:", error);
        return false;
    }
};

export const logout = () => (dispatch) => {
  return new Promise((resolve) => {
    // Create spinner with countdown message
    let countdown = 3;
    document.getElementById('logout-message')?.remove();
    const messageDiv = document.createElement('div');
    messageDiv.id = 'logout-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 30px;
      border-radius: 8px;
      z-index: 9999;
      text-align: center;
      font-family: sans-serif;
      min-width: 300px;
    `;

    // Create spinner element
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Add keyframes for spinner animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);

    messageDiv.appendChild(spinner);
    const textDiv = document.createElement('div');
    textDiv.textContent = `Logging out... Redirecting in ${countdown} seconds`;
    messageDiv.appendChild(textDiv);
    document.body.appendChild(messageDiv);

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        textDiv.textContent = `Logging out... Redirecting in ${countdown} seconds`;
      } else {
        clearInterval(countdownInterval);
        // Clear localStorage and sessionStorage first
        localStorage.clear();
        sessionStorage.clear();
        
        // Then dispatch the logout action
        dispatch({ type: 'auth/setLogout' });
        
        // Remove the message div and redirect
        document.getElementById('logout-message')?.remove();
        window.location.href = '/auth?role=company&type=login';
        resolve();
      }
    }, 1000);
  });
};

const authSlice = createSlice({
    name: 'auth',
    initialState:{
        user: null,
        error: '',
        loading: false,
        businessType: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            // Postavi business type kada se korisnik postavlja
            if (action.payload && action.payload.businessType) {
                state.businessType = action.payload.businessType;
            } else if (action.payload && action.payload.result && action.payload.result.businessType) {
                state.businessType = action.payload.result.businessType;
            }
            
            // Postavi ili produži trajanje sesije
            localStorage.setItem("lastActive", new Date().toISOString());
        },
        setLogout: (state, action) => {
            state.user = null;
            state.businessType = null;
            
            // Očisti sva skladišta
            localStorage.removeItem('profile');
            localStorage.removeItem('token');
            localStorage.removeItem('lastActive');
            
            sessionStorage.removeItem('businessType');
            sessionStorage.clear();
        },
        setBusinessType: (state, action) => {
            state.businessType = action.payload;
            if (action.payload) {
                sessionStorage.setItem('businessType', action.payload);
                
                // Produži trajanje sesije
                localStorage.setItem("lastActive", new Date().toISOString());
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = '';
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.error = '';
                console.log("Login fulfilled with data:", {
                    user: action.payload,
                    countryCode: action.payload.result?.countryCode
                });
                
                // Ensure we store the data with proper country code
                const userData = {
                    ...action.payload,
                    result: {
                        ...action.payload.result,
                        countryCode: action.payload.result?.countryCode?.toLowerCase() || 'ba'
                    }
                };
                
                localStorage.setItem("profile", JSON.stringify(userData));
                state.user = userData;
                
                if (userData.result && userData.result.businessType) {
                    state.businessType = userData.result.businessType;
                } else if (userData.businessType) {
                    state.businessType = userData.businessType;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : "Greška prilikom prijave";
                // Show toast message here
                toast.error(state.error);
            })
            .addCase(registerCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerCompany.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(registerCompany.rejected, (state, action) => {
                state.loading = false;
                console.error("Registration rejected:", action.payload);
                state.error = action.payload
                    ? action.payload.message
                    : "Error during registration";
            })
            .addCase(getUser.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action?.payload;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(getCompany.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(getCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action?.payload;
            })
            .addCase(getCompany.rejected, (state, action) => {
                state.loading = false;
            });
    }
});

export const {setUser, setLogout, setBusinessType} = authSlice.actions;
export default authSlice.reducer;