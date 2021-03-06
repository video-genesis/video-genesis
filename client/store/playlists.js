const deserializePlaylistData = (playlist, deserializeFunc) => {
  if (!playlist.videos) return

  playlist.videos = playlist.videos.map(pItem => {
    if (pItem.video) {
      pItem.video = deserializeFunc([pItem.video])[0]
    }

    return pItem
  })

  return playlist;
}

export const state = () => ({
  playlists: null,
  selected_playlist: null,
});

export const getters = {
  playlists: (state) => state.playlists,
  selected_playlist: (state) => state.selected_playlist,
  get_playlist_by_id: (state) => (sk) => {
    return state.playlists.find((playlist) => playlist.sk == sk);
  },
};

export const actions = {
  async playlistsGet({ commit, rootState }) {
    try {
      const response = await this.$axios.get(
        `playlists/all?username=${rootState.users.rootUser.username}`
      );

      response.data.Items = response.data.Items.map(item => deserializePlaylistData(item, this.$deserializeVideoData))

      commit("playlistsSet", response.data.Items);

    } catch (exception) {
      return null;
    }
  },
  async playlistsGetByUsername({ commit, rootState }, params) {
    try {
      const { username } = params;
      const response = await this.$axios.get(
        `playlists/all?username=${username}`
      );

      response.data.Items = response.data.Items.map(item => deserializePlaylistData(item, this.$deserializeVideoData))

      return response.data.Items;
    } catch (exception) {
      return null;
    }
  },
  async playlistsGetByVideo({ commit, rootState }, params) {
    try {
      const { username, video } = params;
      const response = await this.$axios.get(
        `playlists/all?username=${username}&video=${video}`
      );

      response.data.Items = response.data.Items.map(item => deserializePlaylistData(item, this.$deserializeVideoData))

      return response.data.Items;
    } catch (exception) {
      return null;
    }
  },
  async playlistGet({ commit, rootState }, params) {
    try {
      const response = await this.$axios.get("playlists", { params: params });

      if (!response) {
        return null;
      }

      response.data = deserializePlaylistData(response.data, this.$deserializeVideoData)

      return response.data;
    } catch (exception) {
      return null;
    }
  },

  async getPlaylistsByVideo({ commit, rootState }, { videoSK, username }) {
    try {
      const response = await this.$axios.get("playlists/video", {
        params: { videoSK, username },
      });

      if (!response) {
        return null;
      }

      response.data = deserializePlaylistData(response.data, this.$deserializeVideoData)

      return response.data;
    } catch (exception) {
      return null;
    }
  },
  async getAllplaylists({ commit, rootState }) {
    try {
      const response = await this.$axios.get("playlists/all");

      response.data.Items = response.data.Items.filter(function (obj) {
        return obj.pk !== "ID#" + rootState.users.rootUser.username;
      });

      response.data.Items = response.data.Items.map(item => deserializePlaylistData(item, this.$deserializeVideoData))

      commit("playlistsSet", response.data.Items);
    } catch (exception) {
      return null;
    }
  },
  async playlistsPost({ commit }, params) {
    try {
      const response = await this.$axios.post("playlists", {
        ...params,
      });
      commit("playlistsAdd", response.data);
      return response.data;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  },
  async playlistsPut({}, params) {
    try {
      const response = await this.$axios.put("playlists", params);
      return response.data;
    } catch (exception) {
      return null;
    }
  },
  async playlistsDelete({ commit }, params) {
    try {
      const response = await this.$axios.delete("playlists", { data: params });
      commit("playlistsRemove", params);
      return response.data;
    } catch (exception) {
      return null;
    }
  },
  /*
    params: {
      videos: Video[],
      sk: playlist sk
    }
  */
  async playlistAddVideos(_, params) {
    try {
      const response = await this.$axios.post("playlists/add-videos", params);
      return response.data;
    } catch (e) {
      console.error("playlistAddVideos Exception", e);
      return null;
    }
  },
  /*
    params: {
      videos: Video[],
      sk: playlist sk
    }
  */
  async playlistDeleteVideos(_, params) {
    try {
      const response = await this.$axios.post(
        "playlists/delete-videos",
        params
      );
      return response.data;
    } catch (e) {
      console.error("playlistAddVideos Exception", e);
      return null;
    }
  },
  /*
    params: {
      videoSK: string
      userPK: string
    }
  */
  async getPlaylistsWithoutVideo(_, { videoSK, userPK }) {
    try {
      const response = await this.$axios.get(
        `playlists/without-video?userPK=${userPK}&videoSK=${videoSK}`
      );
      return response.data;
    } catch (e) {
      console.error("playlistAddVideos Exception", e);
      return null;
    }
  },
};

export const mutations = {
  playlistsSet(state, array) {
    state.playlists = array;
  },

  selectedPlaylistSet(state, playlist) {
    state.selected_playlist = playlist;
  },

  playlistUpdate(state, params) {
    if (!params.pk || !params.sk) {
      console.error("playlistUpdate requires pk and sk in the parameter");
    }

    const { pk, sk } = params;

    if (state.playlists) {
      const idx = state.playlists.findIndex((p) => p.pk === pk && p.sk === sk);

      if (idx !== -1) Object.assign(state.playlists[idx], params);
    }

    if (
      state.selected_playlist &&
      state.selected_playlist.pk === pk &&
      state.selected_playlist.sk === sk
    ) {
      Object.assign(state.selected_playlist, params);
    }
  },
  playlistsRemove(state, { pk, sk }) {
    if (!!state.playlists) {
      const index = state.playlists.findIndex(
        (playlist) => playlist.pk == pk && playlist.sk == sk
      );

      if (index != -1) {
        state.playlists.splice(index, 1);
      }
    }

    if (
      state.selected_playlist &&
      state.selected_playlist.pk == pk &&
      state.selected_playlist.sk == sk
    ) {
      state.selected_playlist = null;
    }
  },
  playlistsAdd(state, playlist) {
    if (!state.playlists) {
      state.playlists = [playlist];
    }

    const index = state.playlists.findIndex(
      (p) => p.pk == playlist.pk && p.sk == playlist.sk
    );

    if (index == -1) {
      state.playlists.push(playlist);
    }
  },
};
