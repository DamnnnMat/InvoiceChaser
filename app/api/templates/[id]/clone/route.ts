import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Test route to verify it's accessible
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: 'Clone route is accessible',
    templateId: params.id 
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Clone route called with params:', params)
  try {
    const templateId = params.id

    if (!templateId) {
      console.error('Template ID missing')
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    console.log('Cloning template:', templateId)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Get the system template
    const { data: sourceTemplate, error: templateError } = await adminSupabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !sourceTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get active version
    const { data: activeVersion, error: versionError } = await adminSupabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .single()

    if (versionError || !activeVersion) {
      return NextResponse.json({ error: 'Template version not found' }, { status: 404 })
    }

    // Generate a unique name by checking for existing clones
    const baseName = `${sourceTemplate.name} (Copy)`
    
    // Check if a template with this name already exists
    const { data: existingTemplates } = await adminSupabase
      .from('templates')
      .select('name')
      .eq('user_id', user.id)
      .like('name', `${sourceTemplate.name} (Copy)%`)

    let templateName = baseName
    
    if (existingTemplates && existingTemplates.length > 0) {
      // Check if exact name exists
      const exactMatch = existingTemplates.find(t => t.name === baseName)
      
      if (exactMatch) {
        // Find the highest number suffix
        let maxNum = 1
        const numberPattern = /\(Copy\) \((\d+)\)$/
        
        existingTemplates.forEach(t => {
          const match = t.name.match(numberPattern)
          if (match) {
            const num = parseInt(match[1], 10)
            if (num >= maxNum) maxNum = num + 1
          } else if (t.name === baseName) {
            // The base name exists, so next should be (2)
            maxNum = Math.max(maxNum, 2)
          }
        })
        
        templateName = `${sourceTemplate.name} (Copy) (${maxNum})`
        
        // Double-check the generated name doesn't exist (handle edge cases)
        let counter = maxNum
        while (existingTemplates.some(t => t.name === templateName)) {
          counter++
          templateName = `${sourceTemplate.name} (Copy) (${counter})`
        }
      }
    }

    // Create new user template
    const { data: newTemplate, error: createError } = await adminSupabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: templateName,
        tone: sourceTemplate.tone,
        description: sourceTemplate.description,
        is_system: false,
      })
      .select()
      .single()

    if (createError || !newTemplate) {
      console.error('Error creating template:', createError)
      throw createError || new Error('Failed to create template')
    }

    // Create initial active version from source
    const { data: newVersion, error: newVersionError } = await adminSupabase
      .from('template_versions')
      .insert({
        template_id: newTemplate.id,
        name: 'Initial version',
        subject: activeVersion.subject,
        body: activeVersion.body,
        is_active: true,
      })
      .select()
      .single()

    if (newVersionError || !newVersion) {
      console.error('Error creating template version:', newVersionError)
      // Clean up the template if version creation fails
      await adminSupabase.from('templates').delete().eq('id', newTemplate.id)
      throw newVersionError || new Error('Failed to create template version')
    }

    console.log('Template cloned successfully:', {
      templateId: newTemplate.id,
      name: newTemplate.name,
      subject: newVersion.subject,
      bodyLength: newVersion.body.length,
    })

    // Return the new template ID so we can redirect to edit page
    return NextResponse.json({ 
      template: {
        ...newTemplate,
        active_version: newVersion,
      },
      version: newVersion,
      redirectTo: `/app/templates/${newTemplate.id}/edit`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clone template' },
      { status: 500 }
    )
  }
}
