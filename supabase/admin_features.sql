-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    admin_notes TEXT
);

-- RLS for Contact Submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Anyone can insert contact submissions" 
    ON public.contact_submissions FOR INSERT 
    WITH CHECK (true);

-- Allow admins to view all
CREATE POLICY "Admins can view contact submissions" 
    ON public.contact_submissions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to update
CREATE POLICY "Admins can update contact submissions" 
    ON public.contact_submissions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Testimonials Table (CMS)
CREATE TABLE IF NOT EXISTS public.content_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    image TEXT, -- URL to image
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- RLS for Testimonials
ALTER TABLE public.content_testimonials ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active testimonials
CREATE POLICY "Public can view active testimonials" 
    ON public.content_testimonials FOR SELECT 
    USING (is_active = true);

-- Allow admins to view all (including inactive)
CREATE POLICY "Admins can view all testimonials" 
    ON public.content_testimonials FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to insert/update/delete
CREATE POLICY "Admins can manage testimonials" 
    ON public.content_testimonials FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Seed some initial testimonials (optional)
INSERT INTO public.content_testimonials (name, role, content, rating, image) 
VALUES 
('Sarah Al-Maktoum', 'Villa Owner, Jumeirah', 'INAYA''s team transformed our home. The deep cleaning service was thorough. Highly recommended!', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'),
('James Anderson', 'Resident, Downtown Dubai', 'The AC maintenance service is top-notch. They fixed a leak that others missed.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150');
