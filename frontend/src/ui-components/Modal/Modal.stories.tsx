import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Modal from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <>
        {open && (
          <Modal
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
