import client from '../api/client';
import authService from './auth.service';

const getUserId = () => authService.getUser()?.id;

const getNotes = async () => {
  const { data } = await client.get(`/notes/${getUserId()}`);
  return data.data;
};

const getNoteById = async (noteId) => {
  const { data } = await client.get(`/notes/${getUserId()}/${noteId}`);
  return data.data;
};

const createNote = async ({ title, content }) => {
  const { data } = await client.post('/notes', { title, content, user_id: getUserId() });
  return data.data;
};

const updateNote = async (noteId, { title, content }) => {
  const { data } = await client.put(`/notes/${noteId}`, { title, content, user_id: getUserId() });
  return data.data;
};

const deleteNote = async (noteId) => {
  await client.delete(`/notes/${noteId}`, { data: { user_id: getUserId() } });
};

export default { getNotes, getNoteById, createNote, updateNote, deleteNote };
