import { Tag, TagLabel } from '@chakra-ui/react'
import { SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { useTaggyStore } from '../../../store/taggyStore'

interface Props {
  category: string
  name: string
  tag: string
  enabled: boolean
  addedTag?: string
  noToggled: boolean
}

export default function TaggyTagKeword({ name, tag, enabled, addedTag, noToggled }: Props) {
  const toggleKeyword = useTaggyStore(state => state.toggleKeyword)

  return (
    <Tag
      key={tag}
      size={'md'}
      fontSize={'sm'}
      borderRadius='0'
      border={'1px solid'}
      borderColor={'taggyTags.100'}
      color={enabled ? 'taggyTags.900' : 'taggyText.900'}
      gap={1}
      variant='solid'
      background={enabled ? 'taggyText.900' : 'transparent'}
      cursor={'pointer'}
      margin={1}
      _hover={{ borderColor: 'taggyText.900' }}
      onClick={() => {
        {
          !enabled ? (addedTag = 'Added') : (addedTag = 'Removed')
        }

        toggleKeyword(tag)
      }}
    >
      <TagLabel>{name}</TagLabel>
      {/* {!noToggled && ( */}
      <>
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
      </>
      {/* )} */}
    </Tag>
  )
}
