import ChannelVideo from '../../../data/models/ChannelVideos'

export const queryGetLastVideo = (channelId) => {
  return ChannelVideo.findOne(
    { channel: channelId },
    {},
    {
      sort: {
        createdAt: -1,
      },
    }
  )
}

export const queryUpsertVideos = (videos) => {
  return ChannelVideo.bulkWrite(
    videos.map((item) => ({
      updateOne: {
        filter: {
          id: item.id,
        },
        update: {
          $set: item,
        },
        upsert: true,
      },
    }))
  )
}
