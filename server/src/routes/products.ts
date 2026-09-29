import { Router, Request, Response } from 'express';
import InsuranceProduct from '../models/InsuranceProduct';
import { dbStore, INITIAL_PRODUCTS } from '../services/store';

const router = Router();

// GET /api/insurance-products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let products: any[] = [];

    try {
      const query: any = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { planName: { $regex: String(search), $options: 'i' } },
          { providerName: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } }
        ];
      }
      products = await InsuranceProduct.find(query);
    } catch (e) {
      // Memory fallback
    }

    if (!products || products.length === 0) {
      products = Array.from(dbStore.products.values());
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
      }
      if (search) {
        const q = String(search).toLowerCase();
        products = products.filter(p => 
          p.planName.toLowerCase().includes(q) || 
          p.providerName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
    }

    return res.json({
      success: true,
      count: products.length,
      notice: 'Demo Insurance Products for secure testing and simulation',
      products
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ error: 'Failed to retrieve insurance products' });
  }
});

// GET /api/insurance-products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product: any = null;

    try {
      product = await InsuranceProduct.findById(id);
    } catch (e) {
      // Memory fallback
    }

    if (!product) {
      product = dbStore.products.get(id);
    }

    if (!product) {
      return res.status(404).json({ error: 'Insurance product not found' });
    }

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

export default router;
