// League Payload Structure Helper
// Use this as reference when building league data

export const buildLeaguePayload = {
  // Step 1: Basic Information
  step1: (formData) => ({
    leagueName: formData.leagueName,
    stateId: formData.stateId,
    startDate: formData.startDate,
    mobileBanner: formData.mobileBanner, // File object
    webBanner: formData.webBanner, // File object
    clubs: formData.clubs, // Array of club IDs
    titleSponsor: {
      name: formData.titleSponsorName,
      categoryId: formData.titleSponsorCategoryId,
      logo: formData.titleSponsorLogo // Will be handled separately
    },
    sponsors: formData.sponsors.map(s => ({
      name: s.name,
      categoryId: s.categoryId,
      logo: s.logo // Will be handled separately
    })),
    titleSponsorLogo: formData.titleSponsorLogo, // File object
    sponsorLogos: formData.sponsorLogos, // Array of File objects
    ownerId: formData.ownerId,
    status: 'draft'
  }),

  // Step 2: Structure & Categories
  step2: (formData) => ({
    registration: {
      startDate: formData.registrationStartDate,
      endDate: formData.registrationEndDate,
      fee: formData.registrationFee,
      isEnabled: formData.registrationEnabled
    },
    participationLimit: {
      maxParticipantsPerClub: formData.maxParticipantsPerClub,
      categories: formData.participationCategories
    },
    categories: formData.categories
  }),

  // Step 3: Rules & Settings
  step3: (formData) => ({
    matchRules: {
      regularRound: {
        status: formData.regularRoundStatus,
        setsFormat: formData.regularRoundSetsFormat,
        settings: formData.regularRoundSettings
      },
      quarterfinal: {
        status: formData.quarterfinalStatus,
        setsFormat: formData.quarterfinalSetsFormat,
        settings: formData.quarterfinalSettings
      },
      semifinal: {
        status: formData.semifinalStatus,
        setsFormat: formData.semifinalSetsFormat,
        settings: formData.semifinalSettings
      },
      final: {
        status: formData.finalStatus,
        setsFormat: formData.finalSetsFormat,
        settings: formData.finalSettings
      }
    },
    priceDistribution: formData.priceDistribution,
    status: 'active'
  })
};

// Example usage in component:
/*
import { useDispatch, useSelector } from 'react-redux';
import { createLeague, updateLeague } from '../../../redux/admin/league/thunk';
import { getOwnerFromSession } from '../../../helpers/api/apiCore';

const NewLeague = () => {
  const dispatch = useDispatch();
  const { leagueId, loading } = useSelector(state => state.league);
  const [formData, setFormData] = useState({...});

  // Step 1: Create league
  const handleStep1Submit = async () => {
    const owner = getOwnerFromSession();
    const payload = {
      leagueName: formData.leagueName,
      stateId: formData.stateId,
      startDate: formData.startDate,
      mobileBanner: formData.mobileBanner, // File
      webBanner: formData.webBanner, // File
      clubs: formData.selectedClubs, // Array of IDs
      titleSponsor: { name: '...', categoryId: '...' },
      sponsors: [...],
      titleSponsorLogo: formData.titleSponsorLogo, // File
      sponsorLogos: formData.sponsorLogos, // Array of Files
      ownerId: owner?.ownerId,
      status: 'draft'
    };
    
    const result = await dispatch(createLeague(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      // leagueId will be automatically stored in Redux
      setActiveStep(1);
    }
  };

  // Step 2 & 3: Update league
  const handleStep2Submit = async () => {
    const payload = {
      registration: {...},
      participationLimit: {...},
      categories: [...]
    };
    
    await dispatch(updateLeague({ id: leagueId, leagueData: payload }));
    setActiveStep(2);
  };

  const handleStep3Submit = async () => {
    const payload = {
      matchRules: {...},
      priceDistribution: [...],
      status: 'active'
    };
    
    await dispatch(updateLeague({ id: leagueId, leagueData: payload }));
    navigate('/admin/league');
  };
};
*/
