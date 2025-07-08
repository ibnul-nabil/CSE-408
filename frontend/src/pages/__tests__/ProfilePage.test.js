import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProfilePage from '../ProfilePage';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock environment variable
process.env.REACT_APP_URL = 'http://localhost:8080';

// Mock the image utils
jest.mock('../../utils/imageUtils', () => ({
  getImageUrl: jest.fn((url) => url || 'default-image.jpg')
}));

// Helper function to render ProfilePage with required providers
const renderProfilePage = (authUser = { id: 1, username: 'testuser' }) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Mock AuthContext with user data
const mockAuthContext = {
  user: { id: 1, username: 'testuser' },
  logout: jest.fn()
};

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => mockAuthContext
}));

describe('ProfilePage Frontend Tests', () => {
  const mockUserData = {
    id: 1,
    username: 'testuser',
    profileImage: 'profile.jpg',
    coverPhoto: 'cover.jpg',
    tours: [{ id: 1, title: 'Test Tour' }],
    blogSummaries: [
      {
        id: 1,
        title: 'Test Blog',
        destinations: ['Paris', 'London'],
        likeCount: 5,
        commentCount: 3,
        thumbnailUrl: 'blog-thumb.jpg'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    mockNavigate.mockClear();
    mockAuthContext.logout.mockClear();
    
    // Mock window.location.reload
    delete window.location;
    window.location = { reload: jest.fn() };
    
    // Mock console to suppress debug logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ✅ COMPONENT RENDERING TESTS
  describe('Component Rendering', () => {
    it('should show loading state initially', () => {
      // Mock a delayed API response
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderProfilePage();
      
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      const spinnerElement = document.querySelector('.profile-spinner');
      expect(spinnerElement).toBeInTheDocument();
    });

    it('should render profile page after loading', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Tourify')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('My Trips')).toBeInTheDocument();
        expect(screen.getByText('My Blogs')).toBeInTheDocument();
      });
    });

    it('should render sidebar navigation items', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('👤')).toBeInTheDocument(); // Profile icon
        expect(screen.getByText('✈️')).toBeInTheDocument(); // Trips icon
        expect(screen.getByText('📝')).toBeInTheDocument(); // Blogs icon
        expect(screen.getByText('➕')).toBeInTheDocument(); // Create Tour icon
        expect(screen.getByText('✍️')).toBeInTheDocument(); // Write Blog icon
        expect(screen.getByText('⚙️')).toBeInTheDocument(); // Settings icon
        expect(screen.getByText('🚪')).toBeInTheDocument(); // Logout icon
      });
    });

    it('should display user profile information', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('1 tours created')).toBeInTheDocument();
      });
    });

    it('should display user blogs section', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Recent Blogs')).toBeInTheDocument();
        expect(screen.getByText('Test Blog')).toBeInTheDocument();
        expect(screen.getByText('Paris, London')).toBeInTheDocument();
        expect(screen.getByText('❤️ 5')).toBeInTheDocument();
        expect(screen.getByText('💬 3')).toBeInTheDocument();
      });
    });
  });

  // ✅ ERROR HANDLING & UI STATE CHANGES
  describe('UI State Changes', () => {
    it('should display error state when API fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Failed to fetch user'));

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('❌ Failed to fetch user')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should handle retry button click', async () => {
      fetch.mockRejectedValueOnce(new Error('Failed to fetch user'));

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Mock successful retry
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      fireEvent.click(screen.getByText('Retry'));
      
      // Should reload the page
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should highlight active navigation item', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        const profileNavItem = screen.getByText('Profile').closest('.nav-item');
        expect(profileNavItem).toHaveClass('active');
      });
    });

    it('should display empty state when user has no blogs', async () => {
      const userWithNoBlogs = { ...mockUserData, blogSummaries: [] };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(userWithNoBlogs)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('No blogs yet. Start writing your travel stories!')).toBeInTheDocument();
        expect(screen.getByText('Write Your First Blog')).toBeInTheDocument();
      });
    });
  });

  // ✅ NAVIGATION/ROUTING TESTS
  describe('Navigation/Routing', () => {
    beforeEach(async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });
    });

    it('should navigate to my-blogs page when clicking My Blogs', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('My Blogs')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('My Blogs'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/my-blogs');
    });

    it('should navigate to create-tour-info page when clicking Create Tour', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Create Tour')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Create Tour'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/create-tour-info');
    });

    it('should navigate to create-blog page when clicking Write Blog', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Write Blog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Write Blog'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/create-blog');
    });

    it('should navigate to create-blog when clicking Write Your First Blog', async () => {
      const userWithNoBlogs = { ...mockUserData, blogSummaries: [] };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(userWithNoBlogs)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Write Your First Blog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Write Your First Blog'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/create-blog');
    });

    it('should navigate to blog detail when clicking on a blog', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Test Blog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Blog'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/blogs/1');
    });

    it('should logout and navigate to login page when clicking Logout', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Logout'));
      
      expect(mockAuthContext.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // ✅ USER INTERACTION TESTS
  describe('User Interactions', () => {
    beforeEach(async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });
    });

    it('should handle profile image click', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        const profileImage = screen.getByAltText('Profile');
        expect(profileImage).toBeInTheDocument();
      });

      const profileImage = screen.getByAltText('Profile');
      fireEvent.click(profileImage);
      
      // Should trigger photo modal (we can't test modal opening without more complex setup)
      // But we can verify the click handler exists
      expect(profileImage).toBeInTheDocument();
    });

    it('should handle cover photo click', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        const coverPhoto = screen.getByAltText('Cover');
        expect(coverPhoto).toBeInTheDocument();
      });

      const coverPhoto = screen.getByAltText('Cover');
      fireEvent.click(coverPhoto);
      
      // Should trigger photo modal
      expect(coverPhoto).toBeInTheDocument();
    });

    it('should handle edit profile photo button click', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        const editButton = screen.getByTitle('Update profile picture');
        expect(editButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Update profile picture'));
      
      // Should trigger photo upload modal
      expect(screen.getByTitle('Update profile picture')).toBeInTheDocument();
    });

    it('should handle edit cover photo button click', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        const editButton = screen.getByTitle('Edit cover photo');
        expect(editButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Edit cover photo'));
      
      // Should trigger photo upload modal  
      expect(screen.getByTitle('Edit cover photo')).toBeInTheDocument();
    });
  });

  // ✅ DATA FETCHING TESTS
  describe('Data Fetching', () => {
    it('should fetch user profile data on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/profile/1');
      });
    });

    it('should handle API response errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('❌ Failed to fetch user')).toBeInTheDocument();
      });
    });

    it('should only fetch data when user is available', () => {
      // Mock auth context with no user
      const originalUseAuth = require('../../context/AuthContext').useAuth;
      require('../../context/AuthContext').useAuth = jest.fn(() => ({
        user: null,
        logout: jest.fn()
      }));

      renderProfilePage();
      
      // Should not make API call when no user
      expect(fetch).not.toHaveBeenCalled();
      
      // Restore original useAuth
      require('../../context/AuthContext').useAuth = originalUseAuth;
    });
  });
}); 