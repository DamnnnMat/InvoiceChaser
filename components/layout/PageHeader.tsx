import { ReactNode } from 'react'
import { format } from 'date-fns'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  'data-walkthrough'?: string
}

export default function PageHeader({ title, description, action, 'data-walkthrough': dataWalkthrough }: PageHeaderProps) {
  const currentDate = format(new Date(), 'EEEE, MMMM yyyy')

  return (
    <div className="border-b bg-white px-8 py-6 shadow-sm" data-walkthrough={dataWalkthrough}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {description && (
        <p className="text-slate-600 text-sm mb-3">{description}</p>
      )}
      <div className="text-xs text-slate-500 font-medium">{currentDate}</div>
    </div>
  )
}
