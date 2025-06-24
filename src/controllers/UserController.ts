import { Response } from 'express';
import { supabase } from '../config/dbConfig';
import { clerkClient } from '@clerk/express';
import { AuthenticatedRequest } from '../middleware/requireAuth';

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { clerkId } = req;

        if (!clerkId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, image_url, created_at')
            .eq('clerk_id', clerkId)
            .is('deleted_at', null)
            .single();

        if (error) {
            console.error('Database error in getMe:', error.code);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (!data) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Unexpected error in getMe:', (error as Error).message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const registerUserOnSupabase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clerkId } = req;

    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .is('deleted_at', null)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Database query error code:', queryError.code);
      res.status(500).json({ error: 'Failed to check user existence' });
      return;
    }

    if (existingUser) {
      res.status(409).json({ error: 'User already registered' });
      return;
    }

    const clerkUser = await clerkClient.users.getUser(clerkId);

    if (!clerkUser) {
      res.status(400).json({ error: 'User not found in authentication service' });
      return;
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      res.status(400).json({ error: 'Valid email required' });
      return;
    }

    const firstName = clerkUser.firstName?.trim() || '';
    const lastName = clerkUser.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim() || null;

    let imageUrl = null;
    if (clerkUser.imageUrl) {
      try {
        new URL(clerkUser.imageUrl);
        imageUrl = clerkUser.imageUrl;
      } catch {
        console.warn('Invalid image URL provided, ignoring');
      }
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkId,
        email: userEmail,
        name: fullName,
        image_url: imageUrl,
      })
      .select('id, email, name, image_url, created_at')
      .single();

    if (insertError) {
      console.error('Database insert error code:', insertError.code);
      res.status(500).json({ error: 'Failed to register user' });
      return;
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Unexpected error in registerUserOnSupabase:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
};