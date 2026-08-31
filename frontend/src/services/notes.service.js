import client from '../api/client';

const getNotes = async () => {
  const { data } = await client.get('/notes');
  return data.data;
};

const getNoteById = async (noteId) => {
  const { data } = await client.get(`/notes/${noteId}`);
  return data.data;
};

const createNote = async ({ title, content, color }) => {
  const { data } = await client.post('/notes', { title, content, color });
  return data.data;
};

const updateNote = async (noteId, { title, content, color }) => {
  const { data } = await client.put(`/notes/${noteId}`, { title, content, color });
  return data.data;
};

const deleteNote = async (noteId) => {
  await client.delete(`/notes/${noteId}`);
};

export default { getNotes, getNoteById, createNote, updateNote, deleteNote };
