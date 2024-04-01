import { supabase } from './supabase-client'

export const saveUpload = async (id: string) => {
  try {
    const { data, error } = await supabase.from('uploads').insert({ user_id: id }).select()
    if (error) {
      return null
    }

    if (data?.length) {
      return data[0]
    }
  } catch (error) {
    throw new Error('Error saving upload')
  }
}

export const updateGenerations = async (uploadId: string) => {
  try {
    const { data: uploadData } = await supabase.from('uploads').select('generations').eq('id', uploadId)

    const now = new Date().toISOString()

    if (uploadData?.length) {
      const increment = parseInt(uploadData[0].generations) + 1

      const { error: errorUpdate } = await supabase
        .from('uploads')
        .update({ generations: increment, updated_at: now })
        .eq('id', uploadId)

      if (errorUpdate) {
        throw new Error('Error updating generations')
      }
    }
  } catch (error) {
    throw new Error('Error getting generations')
  }
}
