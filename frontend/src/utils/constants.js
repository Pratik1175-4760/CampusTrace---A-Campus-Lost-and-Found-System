export const CATEGORIES = [
  { value: 'all',        label: 'All Categories' },
  { value: 'ID Card',    label: 'ID Cards' },
  { value: 'Bottle',     label: 'Bottles' },
  { value: 'Calculator', label: 'Calculators' },
  { value: 'Accessory',  label: 'Accessories' },
  { value: 'Other',      label: 'Other' },
]

export const CATEGORY_OPTIONS = [
  { value: 'ID Card',    label: 'ID Card' },
  { value: 'Bottle',     label: 'Bottle' },
  { value: 'Calculator', label: 'Calculator' },
  { value: 'Accessory',  label: 'Accessory' },
  { value: 'Other',      label: 'Other' },
]

export const LOCATIONS = [
  { value: 'all',          label: 'All Locations' },
  { value: 'Library',      label: 'Library' },
  { value: 'Playground',   label: 'Playground' },
  { value: 'Classroom',    label: 'Classrooms' },
  { value: 'Building Block', label: 'Building Blocks' },
  { value: 'Seminar Hall', label: 'Seminar Halls' },
  { value: 'Campus',       label: 'Campus (General)' },
]

export const CLASSROOM_BLOCKS = ['F1', 'A1', 'A2', 'A3']

export const SEMINAR_HALLS = [
  { value: 'E&TC', label: 'E&TC Seminar Hall' },
  { value: 'COMP', label: 'COMP Seminar Hall' },
  { value: 'IT',   label: 'IT Seminar Hall' },
]

export const DATE_FILTERS = [
  { value: 'all',       label: 'All Time' },
  { value: 'today',     label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'custom',    label: 'Custom Range' },
]

export const STATUS_COLORS = {
  reported: { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500',  label: 'Reported'  },
  verified: { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-600',   label: 'At Center' },
  collected:{ bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-600',  label: 'Collected' },
}

export const SUBMISSION_LABELS = {
  with_finder:          'With Finder',
  submitted_to_center:  'At Center',
}

export const BRANCHES = ['Computer Engineering', 'IT', 'E&TC', 'Mechanical', 'Civil', 'Other']
export const DIVISIONS = ['A', 'B', 'C', 'D', 'E', 'F']
