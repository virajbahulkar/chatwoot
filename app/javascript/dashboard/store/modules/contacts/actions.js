import {
  DuplicateContactException,
  ExceptionWithMessage,
} from 'shared/helpers/CustomErrors';
import types from '../../mutation-types';
import ContactAPI from '../../../api/contacts';
import AccountActionsAPI from '../../../api/accountActions';

export const actions = {
  search: async ({ commit }, { search, page, sortAttr, label }) => {
    commit(types.SET_CONTACT_UI_FLAG, { isFetching: true });
    try {
      const {
        data: { payload, meta },
      } = await ContactAPI.search(search, page, sortAttr, label);
      commit(types.CLEAR_CONTACTS);
      commit(types.SET_CONTACTS, payload);
      commit(types.SET_CONTACT_META, meta);
      commit(types.SET_CONTACT_UI_FLAG, { isFetching: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isFetching: false });
    }
  },

  get: async ({ commit }, { page = 1, sortAttr, label } = {}) => {
    commit(types.SET_CONTACT_UI_FLAG, { isFetching: true });
    try {
      const {
        data: { payload, meta },
      } = await ContactAPI.get(page, sortAttr, label);
      commit(types.CLEAR_CONTACTS);
      commit(types.SET_CONTACTS, payload);
      commit(types.SET_CONTACT_META, meta);
      commit(types.SET_CONTACT_UI_FLAG, { isFetching: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isFetching: false });
    }
  },

  show: async ({ commit }, { id }) => {
    commit(types.SET_CONTACT_UI_FLAG, { isFetchingItem: true });
    try {
      const response = await ContactAPI.show(id);
      commit(types.SET_CONTACT_ITEM, response.data.payload);
      commit(types.SET_CONTACT_UI_FLAG, {
        isFetchingItem: false,
      });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, {
        isFetchingItem: false,
      });
    }
  },

  update: async ({ commit }, { id, ...updateObj }) => {
    commit(types.SET_CONTACT_UI_FLAG, { isUpdating: true });
    try {
      const response = await ContactAPI.update(id, updateObj);
      commit(types.EDIT_CONTACT, response.data.payload);
      commit(types.SET_CONTACT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isUpdating: false });
      if (error.response?.data?.contact) {
        throw new DuplicateContactException(error.response.data.contact);
      } else {
        throw new Error(error);
      }
    }
  },

  create: async ({ commit }, userObject) => {
    commit(types.SET_CONTACT_UI_FLAG, { isCreating: true });
    try {
      const response = await ContactAPI.create(userObject);
      commit(types.SET_CONTACT_ITEM, response.data.payload.contact);
      commit(types.SET_CONTACT_UI_FLAG, { isCreating: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isCreating: false });
      if (error.response?.data?.message) {
        throw new ExceptionWithMessage(error.response.data.message);
      } else {
        throw new Error(error);
      }
    }
  },
  import: async ({ commit }, file) => {
    commit(types.SET_CONTACT_UI_FLAG, { isCreating: true });
    try {
      await ContactAPI.importContacts(file);
      commit(types.SET_CONTACT_UI_FLAG, { isCreating: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isCreating: false });
      if (error.response?.data?.message) {
        throw new ExceptionWithMessage(error.response.data.message);
      }
    }
  },
  delete: async ({ commit }, id) => {
    commit(types.SET_CONTACT_UI_FLAG, { isDeleting: true });
    try {
      await ContactAPI.delete(id);
      commit(types.SET_CONTACT_UI_FLAG, { isDeleting: false });
    } catch (error) {
      commit(types.SET_CONTACT_UI_FLAG, { isDeleting: false });
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error);
      }
    }
  },

  deleteCustomAttributes: async ({ commit }, { id, customAttributes }) => {
    try {
      const response = await ContactAPI.destroyCustomAttributes(
        id,
        customAttributes
      );
      commit(types.EDIT_CONTACT, response.data.payload);
    } catch (error) {
      throw new Error(error);
    }
  },

  fetchContactableInbox: async ({ commit }, id) => {
    commit(types.SET_CONTACT_UI_FLAG, { isFetchingInboxes: true });
    try {
      const response = await ContactAPI.getContactableInboxes(id);
      const contact = {
        id,
        contactableInboxes: response.data.payload,
      };
      commit(types.SET_CONTACT_ITEM, contact);
    } catch (error) {
      if (error.response?.data?.message) {
        throw new ExceptionWithMessage(error.response.data.message);
      } else {
        throw new Error(error);
      }
    } finally {
      commit(types.SET_CONTACT_UI_FLAG, { isFetchingInboxes: false });
    }
  },

  updatePresence: ({ commit }, data) => {
    commit(types.UPDATE_CONTACTS_PRESENCE, data);
  },

  setContact({ commit }, data) {
    commit(types.SET_CONTACT_ITEM, data);
  },

  merge: async ({ commit }, { childId, parentId }) => {
    commit(types.SET_CONTACT_UI_FLAG, { isMerging: true });
    try {
      const response = await AccountActionsAPI.merge(parentId, childId);
      commit(types.SET_CONTACT_ITEM, response.data);
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(types.SET_CONTACT_UI_FLAG, { isMerging: false });
    }
  },

  deleteContactThroughConversations: ({ commit }, id) => {
    commit(types.DELETE_CONTACT, id);
    commit(types.CLEAR_CONTACT_CONVERSATIONS, id, { root: true });
    commit(`contactConversations/${types.DELETE_CONTACT_CONVERSATION}`, id, {
      root: true,
    });
  },
};
