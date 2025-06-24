import { Response, Request } from 'express';
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

interface ClerkWebhookEvent {
    data: {
        id: string;
        email_addresses: Array<{
            email_address: string;
            id: string;
        }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
    };
    type: string;
}

export const clerkWebhook = async (req: Request, res: Response) => {
    try {
        const event: ClerkWebhookEvent = req.body;

        if (event.type !== 'user.created') {
            res.status(200).json({ message: 'Event ignored' });
            return;
        }

        const { data: userData } = event;
        const clerkId = userData.id;

        const { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkId)
            .is('deleted_at', null)
            .single();

        if (queryError && queryError.code !== 'PGRST116') {
            console.error('Database query error in webhook:', queryError.code);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }

        if (existingUser) {
            console.log(`User with clerk_id ${clerkId} already exists`);
            res.status(200).json({ message: 'User already exists' });
            return;
        }

        const userEmail = userData.email_addresses[0]?.email_address;
        if (!userEmail) {
            console.error('No email found in webhook data');
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        const firstName = userData.first_name?.trim() || '';
        const lastName = userData.last_name?.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim() || null;

        let imageUrl = null;
        if (userData.image_url) {
            try {
                new URL(userData.image_url);
                imageUrl = userData.image_url;
            } catch {
                console.warn('Invalid image URL in webhook, ignoring');
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
            console.error('Database insert error in webhook:', insertError.code);
            res.status(500).json({ error: 'Failed to create user' });
            return;
        }

        console.log(`User created successfully via webhook: ${newUser.id}`);
        res.status(200).json({ 
            message: 'User created successfully',
            user: newUser 
        });

    } catch (error) {
        console.error('Unexpected error in clerk webhook:', (error as Error).message);
        res.status(500).json({ error: 'Internal server error' });
    }
};