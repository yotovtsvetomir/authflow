import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ConfirmModal from './ConfirmModal'

const meta: Meta<typeof ConfirmModal> = {
  title: 'UI/Modals/ConfirmModal',
  component: ConfirmModal,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ConfirmModal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <>
        {open && (
          <ConfirmModal
            title="You already have a draft"
            description="If you continue, the current draft will be lost. Do you want to proceed?"
            confirmText="Continue"
            cancelText="Cancel"
            onConfirm={() => {
              alert('Confirmed')
              setOpen(false)
            }}
            onCancel={() => {
              alert('Cancelled')
              setOpen(false)
            }}
          />
        )}
      </>
    )
  },
}
