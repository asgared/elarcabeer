import { Tag, TagLabel } from '@chakra-ui/react'
import { SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { useTaggyStore } from '../../../store/taggyStore'

interface Props {
  category: string
  tag: string
  enabled: boolean
  addedTag?: string
}

export default function TaggyTag({ category, tag, enabled, addedTag }: Props) {
  const toggleTag = useTaggyStore(state => state.toggleTag)

  return (
    <Tag
      key={tag}
      size={'md'}
      borderRadius='0'
      border={'1px solid'}
      borderColor={'taggyTags.100'}
      gap={1}
      variant='solid'
      background={enabled ? 'taggyTags.100' : 'transparent'}
      cursor='pointer'
      margin={1}
      _hover={{ borderColor: 'taggyText.900' }}
      onClick={() => {
        {
          !enabled ? (addedTag = 'Added') : (addedTag = 'Removed')
        }
        toggleTag(category, tag)
      }}
    >
      <TagLabel>#{tag}</TagLabel>
      {!enabled ? (
        <SmallAddIcon
          w={'16px'}
          fontSize={'20px'}
        />
      ) : (
        <SmallCloseIcon
          w={'16px'}
          fontSize={'16px'}
        />
      )}
    </Tag>
  )
}
