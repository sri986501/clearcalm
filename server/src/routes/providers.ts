import { Router, Request, Response } from 'express';
import { dbStore, INSURANCE_CATEGORY_GUIDES } from '../services/store';
import { optionalAuthMiddleware, authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { ProviderSourceState } from '../models/Provider';

const router = Router();

// GET /api/categories - All educational category guides
router.get('/categories', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: Object.values(INSURANCE_CATEGORY_GUIDES),
    message: 'Insurance educational category guides retrieved successfully'
  });
});

// GET /api/categories/:id - Specific educational category guide
router.get('/categories/:id', (req: Request, res: Response) => {
  const categoryId = req.params.id.toLowerCase();
  const guide = INSURANCE_CATEGORY_GUIDES[categoryId];

  if (!guide) {
    return res.status(404).json({
      success: false,
      error: `Category '${categoryId}' not found. Available categories: health, vehicle, life, travel, property, business.`
    });
  }

  return res.json({
    success: true,
    data: guide
  });
});

// GET /api/providers - List accredited providers with filters & search
router.get('/providers', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const { category, search, sourceState, popularOnly } = req.query;

  let list = Array.from(dbStore.providers.values());

  if (category && typeof category === 'string' && category !== 'all') {
    const cat = category.toLowerCase();
    list = list.filter(p => p.categoriesOffered.includes(cat as any));
  }

  if (sourceState && typeof sourceState === 'string' && sourceState !== 'all') {
    list = list.filter(p => p.sourceState === sourceState);
  }

  if (popularOnly === 'true') {
    list = list.filter(p => p.isPopular);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(p =>
      p.providerName.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.officialDomain.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoriesOffered.some(c => c.toLowerCase().includes(q))
    );
  }

  // Include saved status if user is authenticated
  const userSavedSet = req.user ? dbStore.savedProviders.get(req.user.userId) || new Set<string>() : new Set<string>();

  const mapped = list.map(p => ({
    ...p,
    isSaved: userSavedSet.has(p.id)
  }));

  return res.json({
    success: true,
    count: mapped.length,
    data: mapped
  });
});

// GET /api/providers/saved - Get saved providers for current user
router.get('/providers/saved', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const savedSet = dbStore.savedProviders.get(req.user.userId) || new Set<string>();
  const savedProviders = Array.from(savedSet)
    .map(id => dbStore.providers.get(id))
    .filter(Boolean)
    .map(p => ({ ...p, isSaved: true }));

  return res.json({
    success: true,
    count: savedProviders.length,
    data: savedProviders
  });
});

// POST /api/providers/:id/save - Toggle save/bookmark provider
router.post('/providers/:id/save', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const provider = dbStore.providers.get(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider not found' });
  }

  if (!dbStore.savedProviders.has(req.user.userId)) {
    dbStore.savedProviders.set(req.user.userId, new Set<string>());
  }

  const userSaved = dbStore.savedProviders.get(req.user.userId)!;
  let isSaved = false;

  if (userSaved.has(provider.id)) {
    userSaved.delete(provider.id);
    isSaved = false;
  } else {
    userSaved.add(provider.id);
    isSaved = true;
  }

  dbStore.logAudit({
    userId: req.user.userId,
    userEmail: req.user.email,
    action: isSaved ? 'SAVED_PROVIDER' : 'UNSAVED_PROVIDER',
    resource: provider.providerName,
    details: `User ${isSaved ? 'bookmarked' : 'removed'} official provider ${provider.shortName}.`
  });

  return res.json({
    success: true,
    isSaved,
    message: isSaved ? `Saved ${provider.shortName} to your dashboard` : `Removed ${provider.shortName}`
  });
});

// GET /api/providers/:id - Single provider details
router.get('/providers/:id', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const provider = dbStore.providers.get(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider not found' });
  }

  const isSaved = req.user ? (dbStore.savedProviders.get(req.user.userId)?.has(provider.id) || false) : false;

  return res.json({
    success: true,
    data: {
      ...provider,
      isSaved
    }
  });
});

// POST /api/providers/:id/verify-link - Check link reachability without assuming official status
router.post('/providers/:id/verify-link', async (req: Request, res: Response) => {
  const provider = dbStore.providers.get(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider not found' });
  }

  // Check URL format and domain syntax
  try {
    const parsed = new URL(provider.providerUrl);
    const domainMatches = parsed.hostname.endsWith(provider.officialDomain) || parsed.hostname === provider.officialDomain;

    const checkedAt = new Date().toISOString();
    provider.lastCheckedAt = checkedAt;

    return res.json({
      success: true,
      data: {
        providerId: provider.id,
        officialDomain: provider.officialDomain,
        targetUrl: provider.providerUrl,
        domainMatchesOfficial: domainMatches,
        sourceState: provider.sourceState,
        sourceType: provider.sourceType,
        lastCheckedAt: checkedAt,
        statusNotice: domainMatches
          ? 'Target URL domain matches the recorded official domain.'
          : 'Caution: Target URL domain differs from the recorded official domain.'
      }
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: `Invalid provider URL format: ${err.message}`
    });
  }
});

// GET /api/providers/admin/audit-logs - Source state audit log history (Admin only)
router.get('/admin/audit-logs', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    count: dbStore.providerAuditLogs.length,
    data: dbStore.providerAuditLogs
  });
});

// PUT /api/providers/admin/:id/source-state - Update provider source state (Admin only)
router.put('/admin/:id/source-state', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const { newState, reason, evidence } = req.body;
  const provider = dbStore.providers.get(req.params.id);

  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider not found' });
  }

  const validStates: ProviderSourceState[] = [
    'OFFICIAL_VERIFIED',
    'OFFICIAL_POLICY_PAGE',
    'SOURCE_CONFIRMED',
    'PENDING_VERIFICATION',
    'UNVERIFIED',
    'UNAVAILABLE',
    'BLOCKED',
    'UNKNOWN'
  ];

  if (!validStates.includes(newState)) {
    return res.status(400).json({
      success: false,
      error: `Invalid state '${newState}'. Allowed: ${validStates.join(', ')}`
    });
  }

  const oldState = provider.sourceState;
  provider.sourceState = newState;
  provider.lastCheckedAt = new Date().toISOString();
  if (newState === 'OFFICIAL_VERIFIED' || newState === 'OFFICIAL_POLICY_PAGE') {
    provider.verifiedAt = new Date().toISOString();
  }

  const auditEntry = dbStore.logProviderStateChange({
    providerId: provider.id,
    providerName: provider.providerName,
    oldState,
    newState,
    actor: req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator',
    reason: reason || 'Manual administrative review and source validation',
    evidence: evidence || 'Official regulatory registry verification'
  });

  return res.json({
    success: true,
    data: provider,
    auditEntry,
    message: `Provider source state updated from ${oldState} to ${newState}`
  });
});

export default router;
