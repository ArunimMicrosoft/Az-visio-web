// Cloud Diagram Storage — save/load diagrams to Supabase
// Provides "My Diagrams" dashboard and shareable links

import { supabase } from './supabase';

/**
 * Save a diagram to Supabase
 */
export async function saveDiagramToCloud(userId, diagram) {
  const { name, items, connections, boundaries } = diagram;
  const shareId = generateShareId();

  const record = {
    user_id: userId,
    name: name || `Untitled - ${new Date().toLocaleDateString()}`,
    share_id: shareId,
    data: JSON.stringify({ items, connections, boundaries }),
    item_count: items.length,
    connection_count: connections.length,
    updated_at: new Date().toISOString(),
  };

  // If diagram has an existing id, update it
  if (diagram.id) {
    const { data, error } = await supabase
      .from('diagrams')
      .update({
        name: record.name,
        data: record.data,
        item_count: record.item_count,
        connection_count: record.connection_count,
        updated_at: record.updated_at,
      })
      .eq('id', diagram.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // New diagram
  const { data, error } = await supabase
    .from('diagrams')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * List all diagrams for a user
 */
export async function listUserDiagrams(userId) {
  const { data, error } = await supabase
    .from('diagrams')
    .select('id, name, share_id, item_count, connection_count, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Load a specific diagram
 */
export async function loadDiagramFromCloud(diagramId, userId) {
  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('id', diagramId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  const parsed = JSON.parse(data.data);
  return { ...data, ...parsed };
}

/**
 * Load a diagram by share ID (public, no auth required)
 */
export async function loadSharedDiagram(shareId) {
  const { data, error } = await supabase
    .from('diagrams')
    .select('id, name, data, item_count, connection_count, created_at')
    .eq('share_id', shareId)
    .single();

  if (error) throw error;
  const parsed = JSON.parse(data.data);
  return { ...data, ...parsed };
}

/**
 * Delete a diagram
 */
export async function deleteDiagramFromCloud(diagramId, userId) {
  const { error } = await supabase
    .from('diagrams')
    .delete()
    .eq('id', diagramId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Rename a diagram
 */
export async function renameDiagram(diagramId, userId, newName) {
  const { error } = await supabase
    .from('diagrams')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('id', diagramId)
    .eq('user_id', userId);

  if (error) throw error;
}

function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
