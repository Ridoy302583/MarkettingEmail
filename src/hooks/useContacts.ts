// hooks/useContacts.ts

import { useEffect } from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { ApiContact, Contact } from '../types/campaign.types';

const API_BASE_URL = 'https://api.websparks.ai';

// Global cache for contacts
let contactsCache: {
  allContacts: Contact[];
  lastFetched: number;
  isLoading: boolean;
} = {
  allContacts: [],
  lastFetched: 0,
  isLoading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const useContacts = () => {
  const {
    contacts,
    allContacts,
    filters,
    loadingContacts,
    contactsError,
    contactSearchTerm,
    selectedContacts,
    setContacts,
    setAllContacts,
    setLoadingContacts,
    setContactsError,
    setSelectedContacts
  } = useCampaignStore();

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  const transformApiContact = (apiContact: ApiContact): Contact => {
    const fullName = apiContact.full_name || '';
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: apiContact.id,
      email: apiContact.email || '',
      firstName,
      lastName,
      fullName,
      profilePic: apiContact.profile_pic,
      role: apiContact.role || 'user',
      registerType: apiContact.register_type || 'general',
      emailVerified: apiContact.email_verified || false,
      status: (apiContact.status as 'active' | 'inactive' | 'pending') || 'pending',
      createdAt: apiContact.created_at || '',
      lastLogin: apiContact.last_login,
      planName: apiContact.plan_name,
    };
  };

  const transformPlanApiContact = (item: { plan: any; user: any }): Contact => {
    const user = item.user;
    const plan = item.plan;

    const fullName = user.full_name || '';
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: user.id,
      email: user.email || '',
      firstName,
      lastName,
      fullName,
      profilePic: user.profile_pic,
      role: user.role || 'user',
      registerType: user.register_type || 'general',
      emailVerified: user.email_verified || false,
      status: (user.status as 'active' | 'inactive' | 'pending') || 'pending',
      createdAt: user.created_at || '',
      lastLogin: user.last_login,
      planName: plan.name || 'Unknown',
    };
  };

  const isCacheValid = () => {
    const now = Date.now();
    return contactsCache.allContacts.length > 0 && 
           (now - contactsCache.lastFetched) < CACHE_DURATION;
  };

  const fetchContacts = async (forceRefresh = false) => {
    try {
      // Check if we can use cached data
      if (!forceRefresh && isCacheValid() && !contactsCache.isLoading) {
        console.log('📋 Using cached contacts:', contactsCache.allContacts.length);
        setAllContacts(contactsCache.allContacts);
        setContacts(contactsCache.allContacts);
        setLoadingContacts(false);
        setContactsError(null);
        return;
      }

      // Prevent multiple simultaneous requests
      if (contactsCache.isLoading) {
        console.log('📋 Contacts already loading, waiting...');
        return;
      }

      contactsCache.isLoading = true;
      setLoadingContacts(true);
      setContactsError(null);
      
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }
      
      let allContactsData: Contact[] = [];
      
      if (filters.planName !== 'all') {
        console.log('📋 Fetching contacts by plan:', filters.planName);
        const url = `${API_BASE_URL}/get-user-by-plan-name/?page=1&per_page=3000&name=${filters.planName}&sort_by=id&sort_order=asc`;
        const response = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        const mappedContacts: Contact[] = data.map(transformPlanApiContact);
        const uniqueContacts: Contact[] = Array.from(
          new Map(mappedContacts.map(c => [c.id, c])).values()
        );
        allContactsData = uniqueContacts;
      } else {
        console.log('📋 Fetching all contacts...');
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const url = `${API_BASE_URL}/users-all/?page=${currentPage}&per_page=100&sort_by=id&sort_order=dsc`;
          
          const response = await fetch(url, {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          let users = [];
          if (Array.isArray(data)) {
            users = data;
            hasMore = data.length === 100;
          } else if (data.users || data.data) {
            users = data.users || data.data;
            const totalPages = data.total_pages || Math.ceil((data.total || 0) / 100);
            hasMore = currentPage < totalPages;
          } else {
            hasMore = false;
          }
          
          const transformedContacts = users.map(transformApiContact);
          allContactsData = [...allContactsData, ...transformedContacts];
          
          currentPage++;
          
          if (currentPage > 50) {
            break;
          }
        }
      }
      
      // Update cache
      contactsCache = {
        allContacts: allContactsData,
        lastFetched: Date.now(),
        isLoading: false
      };
      
      console.log('📋 Contacts fetched and cached:', allContactsData.length);
      
      setAllContacts(allContactsData);
      setContacts(allContactsData);
      
    } catch (err) {
      contactsCache.isLoading = false;
      setContactsError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      console.error('📋 Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const clearContactsCache = () => {
    contactsCache = {
      allContacts: [],
      lastFetched: 0,
      isLoading: false
    };
    console.log('📋 Contacts cache cleared');
  };

  const applyFilters = () => {
    let filtered = [...allContacts];
    
    if (filters.emailVerified === 'verified') {
      filtered = filtered.filter(contact => contact.emailVerified);
    } else if (filters.emailVerified === 'not_verified') {
      filtered = filtered.filter(contact => !contact.emailVerified);
    }
    
    if (filters.registerType !== 'all') {
      filtered = filtered.filter(contact => contact.registerType === filters.registerType);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(contact => contact.status === filters.status);
    }
    
    if (filters.planName !== 'all' && allContacts.length > 0) {
      const hasMixedPlans = allContacts.some(contact => 
        contact.planName && contact.planName !== filters.planName
      );
      if (hasMixedPlans) {
        filtered = filtered.filter(contact => contact.planName === filters.planName);
      }
    }

    if (filters.lastLogin !== 'all') {
      const now = new Date();
      filtered = filtered.filter(contact => {
        if (!contact.lastLogin) {
          return filters.lastLogin === 'never';
        }
        
        const lastLoginDate = new Date(contact.lastLogin);
        const diffTime = now.getTime() - lastLoginDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.lastLogin) {
          case '7_days':
            return diffDays <= 7;
          case '30_days':
            return diffDays <= 30;
          case 'this_month':
            return lastLoginDate.getMonth() === now.getMonth() && lastLoginDate.getFullYear() === now.getFullYear();
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return lastLoginDate.getMonth() === lastMonth.getMonth() && lastLoginDate.getFullYear() === lastMonth.getFullYear();
          default:
            return true;
        }
      });
    }
    
    setContacts(filtered);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.fullName.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(
      selectedContacts.includes(contactId)
        ? selectedContacts.filter(id => id !== contactId)
        : [...selectedContacts, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  const getSelectedContactsData = () => {
    return contacts
      .filter(contact => selectedContacts.includes(contact.id))
      .map(contact => {
        const nameParts = contact.fullName ? contact.fullName.split(' ') : [];
        return {
          email: contact.email,
          firstName: contact.firstName || nameParts[0] || '',
          lastName: contact.lastName || nameParts.slice(1).join(' ') || ''
        };
      });
  };

  // Apply filters when they change
  useEffect(() => {
    if (allContacts.length > 0) {
      applyFilters();
    }
  }, [filters, allContacts]);

  // Reset selected contacts when filters change
  useEffect(() => {
    setSelectedContacts([]);
  }, [filters]);

  // Load contacts from cache or fetch on mount
  useEffect(() => {
    if (isCacheValid()) {
      console.log('📋 Loading contacts from cache on mount');
      setAllContacts(contactsCache.allContacts);
      setContacts(contactsCache.allContacts);
    }
  }, []);

  return {
    contacts,
    allContacts,
    filteredContacts,
    selectedContacts,
    loadingContacts,
    contactsError,
    fetchContacts,
    clearContactsCache,
    handleSelectContact,
    handleSelectAllContacts,
    getSelectedContactsData,
    isCacheValid: () => isCacheValid()
  };
};
