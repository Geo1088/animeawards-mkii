/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

async function makeRequest (path, method = 'GET', body) {
	if (typeof body === 'object' && body != null) {
		body = JSON.stringify(body);
	}
	try {
		const result = await fetch(path, {method, body});
		if (!result.ok) {
			const json = await result.json();
			throw json.error;
		}
		if (result.status === 204) {
			return;
		}
		return await result.json();
	} catch (error) {
		// eslint-disable-next-line no-alert
		window.alert(error);
		throw error;
	}
}

const store = new Vuex.Store({
	state: {
		me: null,
		users: null,
		categories: null,
		themes: null,
		voteSummary: null,
		voteTotals: null,
		opedTotals: null,
		dashTotals: null,
		nominations: null,
		hms: null,
		jurors: null,
		allNoms: null,
		entries: null,
		locks: null,
	},
	getters: {
		isHost (state) {
			return state.me && state.me.level >= 2;
		},
		isMod (state) {
			return state.me && state.me.level >= 3;
		},
		isAdmin (state) {
			return state.me && state.me.level >= 4;
		},
	},
	mutations: {
		GET_ME (state, me) {
			state.me = me;
		},

		GET_USERS (state, users) {
			state.users = users;
		},
		ADD_USER (state, user) {
			state.users.push(user);
		},
		REMOVE_USER (state, reddit) {
			const index = state.users.findIndex(user => user.reddit === reddit);
			state.users.splice(index, 1);
		},
		GET_CATEGORIES (state, categories) {
			state.categories = categories;
		},
		CREATE_CATEGORY (state, category) {
			state.categories.push(category);
		},
		UPDATE_CATEGORY (state, category) {
			const index = state.categories.findIndex(cat => cat.id === category.id);
			state.categories.splice(index, 1, category);
		},
		DELETE_CATEGORY (state, categoryId) {
			const index = state.categories.findIndex(cat => cat.id === categoryId);
			state.categories.splice(index, 1);
		},
		UPDATE_THEMES (state, themes) {
			state.themes = themes;
		},
		GET_VOTE_SUMMARY (state, voteSummary) {
			state.voteSummary = voteSummary;
		},
		GET_VOTE_TOTALS (state, voteTotals) {
			state.voteTotals = voteTotals;
		},
		GET_DASHBOARD_TOTALS (state, dashTotals) {
			state.dashTotals = dashTotals;
		},
		GET_OPED_TOTALS (state, opedTotals) {
			state.opedTotals = opedTotals;
		},
		GET_NOMINATIONS (state, nominations) {
			state.nominations = nominations;
		},
		INSERT_NOMINATION (state, nomination) {
			state.nominations.push(nomination);
		},
		DELETE_NOMINATIONS (state) {
			// state.nominations = [];
		},
		GET_ALL_NOMINATIONS (state, allNoms) {
			state.allNoms = allNoms;
		},
		GET_JURORS (state, jurors) {
			state.jurors = jurors;
		},
		INSERT_JURORS (state, jurors) {
			state.jurors = jurors;
		},
		DELETE_JURORS (state) {
			// state.nominations = [];
		},
		GET_HMS (state, hms) {
			state.hms = hms;
		},
		INSERT_HMS (state, hms) {
			state.hms = hms;
		},
		DELETE_HMS (state) {
			// state.nominations = [];
		},
		WIPE_EVERYTHING (state) {
			state.nominations = null;
			state.hms = null;
			state.jurors = null;
			state.entries = null;
		},
		UPDATE_ENTRIES (state, entries) {
			state.entries = entries;
		},
		UPDATE_LOCKS (state, locks) {
			state.locks = locks;
		},
	},
	actions: {
		async getMe ({commit}) {
			const response = await fetch('/api/user/me');
			if (!response.ok) return;
			const me = await response.json();
			commit('GET_ME', me);
		},

		async getUsers ({commit}) {
			const users = await makeRequest('/api/user/all');
			commit('GET_USERS', users);
		},
		async addUser ({commit}, user) {
			const finalUser = await makeRequest('/api/user', 'POST', user);
			commit('ADD_USER', finalUser);
		},
		async removeUser ({commit}, reddit) {
			await makeRequest(`/api/user/${reddit}`, 'DELETE');
			commit('REMOVE_USER', reddit);
		},

		async getCategories ({commit}) {
			const categories = await makeRequest('/api/category/all');
			commit('GET_CATEGORIES', categories);
		},
		async createCategory ({commit}, {data}) {
			const category = await makeRequest('/api/category', 'POST', data);
			commit('CREATE_CATEGORY', category);
		},
		async updateCategory ({commit}, {id, data}) {
			// console.log(id, data);
			// TODO: I don't like that the id and the data are in the same object here
			const updatedCategoryData = await makeRequest(`/api/category/${id}`, 'PATCH', {id, ...data});
			commit('UPDATE_CATEGORY', updatedCategoryData);
		},
		async deleteCategory ({commit}, categoryId) {
			await makeRequest(`/api/category/${categoryId}`, 'DELETE');
			commit('DELETE_CATEGORY', categoryId);
		},
		async getThemes ({commit}) {
			const themes = await makeRequest('/api/themes');
			commit('UPDATE_THEMES', themes);
		},
		async createThemes ({commit}, {data}) {
			const themes = await makeRequest('/api/themes/create', 'POST', data);
			commit('UPDATE_THEMES', themes);
		},
		async deleteThemes ({commit}, themeType) {
			const themes = await makeRequest(`/api/themes/delete/${themeType}`, 'DELETE');
			commit('UPDATE_THEMES', themes);
		},
		async getVoteSummary ({commit}) {
			const voteSummary = await makeRequest('/api/votes/summary');
			commit('GET_VOTE_SUMMARY', voteSummary);
		},
		async getVoteTotals ({commit}) {
			const voteTotals = await makeRequest('/api/votes/all/get');
			commit('GET_VOTE_TOTALS', voteTotals);
		},
		async getDashboardTotals ({commit}) {
			const dashTotals = await makeRequest('/api/votes/dashboard/get');
			commit('GET_DASHBOARD_TOTALS', dashTotals);
		},
		async getOPEDTotals ({commit}) {
			const opedTotals = await makeRequest('/api/votes/oped/get');
			commit('GET_OPED_TOTALS', opedTotals);
		},
		async getNominations ({commit}, categoryId) {
			const noms = await makeRequest(`/api/category/${categoryId}/nominations`);
			commit('GET_NOMINATIONS', noms);
		},
		async insertNominations ({commit}, {id, data}) {
			const noms = await makeRequest(`/api/category/${id}/nominations`, 'POST', data);
			commit('UPDATE_NOMINATIONS', noms);
		},
		async deleteNominations ({commit}, id) {
			await makeRequest(`/api/category/${id}/nominations`, 'DELETE');
			commit('DELETE_NOMINATIONS');
		},
		async getAllNominations ({commit}) {
			const noms = await makeRequest('/api/category/nominations/all');
			commit('GET_ALL_NOMINATIONS', noms);
		},
		async getJurors ({commit}, categoryId) {
			const jurors = await makeRequest(`/api/category/${categoryId}/jurors`);
			commit('GET_JURORS', jurors);
		},
		async insertJurors ({commit}, {id, data}) {
			const jurors = await makeRequest(`/api/category/${id}/jurors`, 'POST', data);
			commit('UPDATE_JURORS', jurors);
		},
		async deleteJurors ({commit}, id) {
			await makeRequest(`/api/category/${id}/jurors`, 'DELETE');
			commit('DELETE_JURORS');
		},
		async getAllJurors ({commit}) {
			const jurors = await makeRequest('/api/category/jurors/all');
			commit('GET_JURORS', jurors);
		},
		async getHMs ({commit}, categoryId) {
			const hms = await makeRequest(`/api/category/${categoryId}/hms`);
			commit('GET_HMS', hms);
		},
		async insertHMs ({commit}, {id, data}) {
			const hms = await makeRequest(`/api/category/${id}/hms`, 'POST', data);
			commit('UPDATE_HMS', hms);
		},
		async deleteHMs ({commit}, id) {
			await makeRequest(`/api/category/${id}/hms`, 'DELETE');
			commit('DELETE_HMS');
		},
		async getAllHMs ({commit}) {
			const hms = await makeRequest('/api/category/hms/all');
			commit('GET_HMS', hms);
		},
		async wipeEverything ({commit}) {
			await makeRequest('/api/category/wipeEverything', 'DELETE');
			commit('WIPE_EVERYTHING');
		},
		async getEntries ({commit}, id) {
			const entries = await makeRequest(`/api/category/${id}/entries`);
			commit('UPDATE_ENTRIES', entries);
		},
		async updateEntries ({commit}, {id, entries}) {
			const data = await makeRequest(`/api/category/${id}/entries`, 'POST', entries);
			commit('UPDATE_ENTRIES', data);
		},
		async getLocks ({commit}) {
			const locks = await makeRequest('/api/locks/all');
			commit('UPDATE_LOCKS', locks);
		},
		async updateLocks ({commit}, locks) {
			await makeRequest('/api/locks', 'POST', locks);
			commit('UPDATE_LOCKS', locks);
		},
	},
});

export default store;
