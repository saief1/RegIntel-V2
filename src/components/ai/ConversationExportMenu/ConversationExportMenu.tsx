import { Copy, Download, FileText, Printer } from 'lucide-react'
import type { Conversation } from '../../../types/ai'
import {
  copyConversation,
  downloadConversationMarkdown,
  printConversation,
} from '../../../utils/conversationExport'
import { Button } from '../../ui/Button/Button'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem } from '../../ui/Dropdown/DropdownItem'

interface ConversationExportMenuProps {
  conversation: Conversation
}

export function ConversationExportMenu({ conversation }: ConversationExportMenuProps) {
  return (
    <Dropdown
      align="end"
      width={220}
      trigger={
        <Button size="sm" variant="secondary" leadingIcon={<Download size={14} aria-hidden="true" />}>
          Export
        </Button>
      }
    >
      {(close) => (
        <>
          <DropdownItem
            icon={<FileText size={14} />}
            onClick={() => {
              window.alert('PDF export is a placeholder in this local build. Use Markdown or Print for now.')
              close()
            }}
          >
            PDF (placeholder)
          </DropdownItem>
          <DropdownItem
            icon={<Download size={14} />}
            onClick={() => {
              downloadConversationMarkdown(conversation)
              close()
            }}
          >
            Markdown
          </DropdownItem>
          <DropdownItem
            icon={<Copy size={14} />}
            onClick={() => {
              void copyConversation(conversation)
              close()
            }}
          >
            Copy
          </DropdownItem>
          <DropdownItem
            icon={<Printer size={14} />}
            onClick={() => {
              printConversation(conversation)
              close()
            }}
          >
            Print
          </DropdownItem>
        </>
      )}
    </Dropdown>
  )
}
