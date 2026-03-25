'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/lib/actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'

export function DeleteButton({ id, nome }: { id: string; nome: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)

  async function handleConfirm() {
    await deleteProject(id)
    showToast('Projeto excluído com sucesso', 'success')
    router.push('/projetos')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-red-500/10"
        style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
      >
        Excluir Projeto
      </button>

      <ConfirmModal
        isOpen={open}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
