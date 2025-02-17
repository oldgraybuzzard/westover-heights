-- Add response templates table
CREATE TABLE response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts can create templates"
  ON response_templates FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE 'EXPERT' = ANY(roles) OR 'ADMIN' = ANY(roles)
  ));

CREATE POLICY "Experts can view templates"
  ON response_templates FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE 'EXPERT' = ANY(roles) OR 'ADMIN' = ANY(roles)
    ) OR is_global = true
  );

CREATE POLICY "Experts can update own templates"
  ON response_templates FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT id FROM profiles WHERE 'ADMIN' = ANY(roles)
  ));

-- Add template categories enum
CREATE TYPE template_category AS ENUM (
  'GENERAL',
  'TESTING',
  'TREATMENT',
  'PREVENTION',
  'SUPPORT'
);

-- Add some default templates
INSERT INTO response_templates (title, content, category, is_global) VALUES
(
  'Testing Information',
  'Thank you for your question about testing. Here are the key points about herpes testing:

1. Blood tests (IgG) can detect antibodies
2. Swab tests are most accurate during an outbreak
3. Testing is recommended if you have symptoms

Would you like more specific information about any of these testing methods?',
  'TESTING',
  true
),
(
  'Treatment Options',
  'There are several treatment options available:

1. Antiviral medications
2. Lifestyle modifications
3. Stress management techniques

Would you like me to provide more details about any of these approaches?',
  'TREATMENT',
  true
),
(
  'Prevention Guidelines',
  'Here are the key prevention strategies:

1. Understanding transmission risks
2. Using protection during intimate contact
3. Being aware of prodrome symptoms
4. Communication with partners

Let me know if you would like more specific information about any of these points.',
  'PREVENTION',
  true
); 