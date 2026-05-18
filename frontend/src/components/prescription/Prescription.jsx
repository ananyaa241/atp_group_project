import { useEffect, useRef, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  FaPrescriptionBottleAlt, FaPlus, FaTrash, FaUpload,
  FaImage, FaCheckCircle, FaSpinner, FaFilePdf
} from 'react-icons/fa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'

function Prescription() {
  const { user, role } = useContext(AuthContext)
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState(role === 'doctor' ? 'add' : 'view')

  // ── Cloudinary upload state ──────────────────────────────────────────────────
  const [imageFile, setImageFile]         = useState(null)
  const [imagePreview, setImagePreview]   = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)
  const [uploading, setUploading]         = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      patientId: '',
      doctorId: role === 'doctor' ? user?._id || '' : '',
      age: '',
      gender: '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      notes: '',
      medicines: [{ medicineName: '', dosage: '', duration: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' })

  // ── Fetch all initial data ────────────────────────────────────────────────────
  async function loadPrescriptions() {
    try {
      let rxRes
      if (role === 'patient' && user?._id) {
        rxRes = await axiosInstance.get(`/prescription-api/patient/${user._id}`)
      } else if (role === 'doctor' && user?._id) {
        rxRes = await axiosInstance.get(`/prescription-api/doctor/${user._id}`)
      } else if (role === 'admin') {
        rxRes = await axiosInstance.get('/prescription-api/all')
      }
      setPrescriptions(rxRes?.data?.payload || [])
    } catch {
      toast.error('Failed to load prescription records')
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)
        const [docRes] = await Promise.all([
          axiosInstance.get('/doctor-api/doctors')
        ])
        setDoctors(docRes.data.payload || [])
        
        let pats = []
        if (role === 'doctor' && user?._id) {
          const apptRes = await axiosInstance.get(`/appointment-api/doctor/${user._id}`)
          const appts = apptRes.data.payload || []
          const patientMap = new Map()
          appts.forEach(a => {
            if (a.patientId && a.patientId._id) patientMap.set(a.patientId._id, a.patientId)
          })
          pats = Array.from(patientMap.values())
        } else {
          const patRes = await axiosInstance.get('/patient-api/patients')
          pats = patRes.data.payload || []
        }
        setPatients(pats)
        await loadPrescriptions()
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [user, role])

  // ── Handle image select ───────────────────────────────────────────────────────
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setUploadedImageUrl(null)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  // ── Upload to Cloudinary via backend ─────────────────────────────────────────
  async function handleImageUpload() {
    if (!imageFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('prescriptionImage', imageFile)
      const res = await axiosInstance.post('/prescription-api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data.payload?.url
      setUploadedImageUrl(url)
      toast.success('Image uploaded to Cloudinary ✅')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Submit prescription ───────────────────────────────────────────────────────
  async function onSubmit(data) {
    try {
      data.medicines = data.medicines.filter(m => m.medicineName.trim())
      if (uploadedImageUrl) data.handwrittenImageUrl = uploadedImageUrl
      await axiosInstance.post('/prescription-api/add', data)
      toast.success('Prescription added successfully')
      reset()
      setImageFile(null)
      setImagePreview(null)
      setUploadedImageUrl(null)
      // Refresh view records
      await loadPrescriptions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add prescription')
    }
  }

  const handleDownloadPDF = (rx) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(13, 148, 136) // teal-600
    doc.text('MediCare+ Hospital', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Prescription Record', 14, 30)
    
    // Doctor & Patient Info
    doc.setFontSize(11)
    doc.setTextColor(40)
    
    const startY = 45
    doc.text(`Doctor: Dr. ${rx.doctorId?.name || 'N/A'}`, 14, startY)
    doc.text(`Specialization: ${rx.doctorId?.specialization || 'N/A'}`, 14, startY + 6)
    
    doc.text(`Patient: ${rx.patientId?.name || 'N/A'}`, 120, startY)
    doc.text(`Age/Gender: ${rx.age || rx.patientId?.age || '-'} / ${rx.gender || rx.patientId?.gender || '-'}`, 120, startY + 6)
    doc.text(`Date: ${new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}`, 120, startY + 12)

    // Medicines Table
    const tableData = rx.medicines?.map(m => [m.medicineName, m.dosage, m.duration]) || []
    
    autoTable(doc, {
      startY: startY + 25,
      head: [['Medicine Name', 'Dosage', 'Duration']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }
    })
    
    // Notes
    if (rx.notes) {
      const finalY = doc.lastAutoTable.finalY || startY + 25
      doc.text('Clinical Notes:', 14, finalY + 15)
      doc.setFontSize(10)
      doc.setTextColor(80)
      doc.text(rx.notes, 14, finalY + 22, { maxWidth: 180 })
    }
    
    doc.save(`Prescription_${rx.patientId?.name?.split(' ').join('_') || 'Patient'}_${new Date(rx.createdAt).getTime()}.pdf`)
  }

  if (loadingData) return <Loader />

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className='mb-6 pb-5 border-b' style={{ borderColor: 'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Medical Records</p>
        <h1 className='mt-1 text-xl font-bold text-[color:var(--txt-primary)] '>Prescriptions</h1>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────────── */}
      <div className='flex gap-2 mb-6'>
        {role === 'doctor' && (
          <button
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'add'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[color:var(--txt-secondary)] hover:border-teal-300 dark:bg-[var(--bg-card)]  '
            }`}
          >
            Add Prescription
          </button>
        )}
        <button
          onClick={() => { setActiveTab('view'); loadPrescriptions() }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'view'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
              : 'bg-[var(--bg-card)] border border-[var(--border)] text-[color:var(--txt-secondary)] hover:border-teal-300 dark:bg-[var(--bg-card)]  '
          }`}
        >
          View Records
        </button>
      </div>

      <AnimatePresence mode='wait'>

        {/* ── Add Prescription Form ─────────────────────────────────────────────── */}
        {activeTab === 'add' && role === 'doctor' && (
          <motion.div key='add' initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
            <div className='rounded-2xl bg-[var(--bg-card)] p-7 shadow-lg border border-[var(--border)] dark:bg-[var(--bg-card)] '>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

                <div className='grid md:grid-cols-2 gap-5'>
                  {/* Patient select */}
                  <label className={`block ${role === 'doctor' ? 'md:col-span-2' : ''}`}>
                    <span className='text-sm text-[color:var(--txt-secondary)]  font-medium'>Patient</span>
                    <select
                      {...register('patientId', { required: 'Patient is required' })}
                      className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition  dark:bg-[var(--bg-card)] '
                    >
                      <option value=''>Select patient...</option>
                      {patients.map(p => (
                        <option key={p._id} value={p._id}>{p.name} — {p.email}</option>
                      ))}
                    </select>
                    {errors.patientId && <p className='mt-1 text-xs text-rose-500'>{errors.patientId.message}</p>}
                  </label>

                  {/* Doctor select */}
                  {role !== 'doctor' ? (
                  <label className='block'>
                    <span className='text-sm text-[color:var(--txt-secondary)]  font-medium'>Doctor</span>
                    <select
                      {...register('doctorId', { required: 'Doctor is required' })}
                      className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition  dark:bg-[var(--bg-card)] '
                    >
                      <option value=''>Select doctor...</option>
                      {doctors.map(d => (
                        <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>
                      ))}
                    </select>
                    {errors.doctorId && <p className='mt-1 text-xs text-rose-500'>{errors.doctorId.message}</p>}
                  </label>
                  ) : (
                    <input type='hidden' {...register('doctorId')} value={user?._id} />
                  )}

                  {/* Age */}
                  <label className='block'>
                    <span className='text-sm text-[color:var(--txt-secondary)] font-medium'>Age</span>
                    <input
                      type='number'
                      {...register('age', { required: 'Age is required', min: 0 })}
                      placeholder='e.g. 35'
                      className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition dark:bg-[var(--bg-card)]'
                    />
                    {errors.age && <p className='mt-1 text-xs text-rose-500'>{errors.age.message}</p>}
                  </label>

                  {/* Gender */}
                  <label className='block'>
                    <span className='text-sm text-[color:var(--txt-secondary)] font-medium'>Gender</span>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition dark:bg-[var(--bg-card)]'
                    >
                      <option value=''>Select gender...</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                    {errors.gender && <p className='mt-1 text-xs text-rose-500'>{errors.gender.message}</p>}
                  </label>

                  {/* Date */}
                  <label className='block md:col-span-2'>
                    <span className='text-sm text-[color:var(--txt-secondary)] font-medium'>Prescription Date</span>
                    <input
                      type='date'
                      {...register('prescriptionDate', { required: 'Date is required' })}
                      className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition dark:bg-[var(--bg-card)]'
                    />
                    {errors.prescriptionDate && <p className='mt-1 text-xs text-rose-500'>{errors.prescriptionDate.message}</p>}
                  </label>
                </div>

                {/* ── Medicines ────────────────────────────────────────────────────── */}
                <div>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-semibold text-[color:var(--txt-primary)] '>Medicines</span>
                    <button
                      type='button'
                      onClick={() => append({ medicineName: '', dosage: '', duration: '' })}
                      className='flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-100 transition  '
                    >
                      <FaPlus size={10} /> Add Medicine
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {fields.map((field, index) => (
                      <div key={field.id} className='grid md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end'>
                        <div>
                          <span className='text-xs text-[color:var(--txt-muted)] mb-1 block'>Medicine Name</span>
                          <input
                            {...register(`medicines.${index}.medicineName`)}
                            placeholder='e.g. Paracetamol 500mg'
                            className='w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 transition  dark:bg-[var(--bg-card)] '
                          />
                        </div>
                        <div>
                          <span className='text-xs text-[color:var(--txt-muted)] mb-1 block'>Dosage</span>
                          <input
                            {...register(`medicines.${index}.dosage`)}
                            placeholder='e.g. 1-0-1'
                            className='w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 transition  dark:bg-[var(--bg-card)] '
                          />
                        </div>
                        <div>
                          <span className='text-xs text-[color:var(--txt-muted)] mb-1 block'>Duration</span>
                          <input
                            {...register(`medicines.${index}.duration`)}
                            placeholder='e.g. 5 days'
                            className='w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 transition  dark:bg-[var(--bg-card)] '
                          />
                        </div>
                        {fields.length > 1 && (
                          <button
                            type='button'
                            onClick={() => remove(index)}
                            className='rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-400 hover:bg-rose-100 transition dark:border-rose-800 dark:bg-rose-900/30'
                          >
                            <FaTrash size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Clinical Notes ───────────────────────────────────────────────── */}
                <label className='block'>
                  <span className='text-sm text-[color:var(--txt-secondary)]  font-medium'>Clinical Notes</span>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder='Additional instructions for the patient...'
                    className='mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[color:var(--txt-primary)] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition resize-none  dark:bg-[var(--bg-card)] '
                  />
                </label>

                {/* ── Cloudinary Handwritten Prescription Upload ────────────────────── */}
                <div className='rounded-xl border border-dashed border-teal-300 bg-teal-50/50 p-5  '>
                  <div className='flex items-center gap-2 mb-3'>
                    <FaImage className='text-teal-500' />
                    <span className='text-sm font-semibold text-[color:var(--txt-primary)] '>
                      Upload Handwritten Prescription
                    </span>
                    <span className='ml-auto text-xs text-[color:var(--txt-muted)] font-normal'>Optional — via Cloudinary</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='hidden'
                    id='handwrittenInput'
                  />

                  {/* Drop zone / click to select */}
                  {!imagePreview ? (
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-teal-300 bg-[var(--bg-card)] py-8 text-[color:var(--txt-muted)] hover:border-teal-500 hover:text-teal-500 transition dark:bg-[var(--bg-card)] '
                    >
                      <FaUpload size={22} />
                      <span className='text-sm'>Click to select a prescription image</span>
                      <span className='text-xs'>PNG, JPG, JPEG supported</span>
                    </button>
                  ) : (
                    <div className='space-y-3'>
                      {/* Preview */}
                      <div className='relative rounded-xl overflow-hidden border border-[var(--border)] '>
                        <img src={imagePreview} alt='Prescription preview' className='w-full max-h-56 object-contain bg-[var(--bg-card)] dark:bg-[var(--bg-card)]' />
                        <button
                          type='button'
                          onClick={() => { setImageFile(null); setImagePreview(null); setUploadedImageUrl(null) }}
                          className='absolute top-2 right-2 rounded-full bg-rose-500 text-white p-1.5 hover:bg-rose-600 transition'
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>

                      {uploadedImageUrl ? (
                        <div className='flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 dark:bg-emerald-900/20 dark:border-emerald-800'>
                          <FaCheckCircle className='text-emerald-500 flex-shrink-0' />
                          <div className='min-w-0'>
                            <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-300'>Uploaded to Cloudinary</p>
                            <a
                              href={uploadedImageUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-xs text-emerald-600 underline truncate block dark:text-emerald-400'
                            >
                              {uploadedImageUrl}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <button
                          type='button'
                          onClick={handleImageUpload}
                          disabled={uploading}
                          className='flex items-center justify-center gap-2 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition'
                        >
                          {uploading ? (
                            <><FaSpinner className='animate-spin' size={13} /> Uploading...</>
                          ) : (
                            <><FaUpload size={13} /> Upload to Cloudinary</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60 shadow-md shadow-teal-500/25'
                >
                  {isSubmitting ? 'Saving...' : 'Save Prescription'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── View Prescriptions ──────────────────────────────────────────────────── */}
        {activeTab === 'view' && (
          <motion.div key='view' initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            {prescriptions.length === 0 ? (
              <EmptyState
                icon={FaPrescriptionBottleAlt}
                title='No prescriptions found'
                message={
                  role === 'patient'
                    ? 'Your prescriptions will appear here after a consultation.'
                    : 'No prescription records yet.'
                }
              />
            ) : (
              <div className='space-y-4'>
                {prescriptions.map((rx, i) => (
                  <motion.div
                    key={rx._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className='rounded-2xl bg-[var(--bg-card)] p-6 shadow-md border border-[var(--border)] dark:bg-[var(--bg-card)] '
                  >
                    <div className='flex items-start justify-between flex-wrap gap-3'>
                      <div>
                        {role !== 'doctor' && rx.doctorId?.name && (
                          <p className='text-sm text-[color:var(--txt-muted)]'>
                            Prescribed by <strong className='text-teal-600'>Dr. {rx.doctorId.name}</strong>
                            {rx.doctorId.specialization && (
                              <span className='ml-1 text-xs text-[color:var(--txt-muted)]'>({rx.doctorId.specialization})</span>
                            )}
                          </p>
                        )}
                        {role !== 'patient' && rx.patientId?.name && (
                          <p className='text-sm text-[color:var(--txt-muted)] mt-0.5'>
                            Patient: <strong className='text-[color:var(--txt-primary)] '>{rx.patientId.name}</strong>
                          </p>
                        )}
                        <p className='text-xs text-[color:var(--txt-muted)] mt-1'>
                          {new Date(rx.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                        </p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-semibold text-teal-600  '>
                          {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => handleDownloadPDF(rx)}
                          className='flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition'
                        >
                          <FaFilePdf size={12} />
                          Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Medicines grid */}
                    {rx.medicines?.length > 0 && (
                      <div className='mt-4 grid md:grid-cols-3 gap-3'>
                        {rx.medicines.map((med, j) => (
                          <div key={j} className='rounded-xl bg-teal-50 border border-teal-100 p-3.5  '>
                            <p className='text-sm font-semibold text-[color:var(--txt-primary)] '>{med.medicineName}</p>
                            <p className='text-xs text-[color:var(--txt-muted)] mt-1'>Dosage: {med.dosage}</p>
                            <p className='text-xs text-[color:var(--txt-muted)]'>Duration: {med.duration}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {rx.notes && (
                      <p className='mt-3 text-sm text-[color:var(--txt-secondary)] dark:text-[color:var(--txt-muted)] bg-[var(--bg-subtle)] dark:bg-[var(--bg-subtle)] rounded-xl p-3.5'>
                        📋 {rx.notes}
                      </p>
                    )}

                    {/* Handwritten image */}
                    {rx.handwrittenImageUrl && (
                      <div className='mt-3'>
                        <p className='text-xs font-semibold text-[color:var(--txt-muted)] mb-2 uppercase tracking-wide'>Handwritten Prescription</p>
                        <a href={rx.handwrittenImageUrl} target='_blank' rel='noopener noreferrer'>
                          <img
                            src={rx.handwrittenImageUrl}
                            alt='Handwritten prescription'
                            className='rounded-xl border border-[var(--border)] max-h-48 object-contain  hover:opacity-90 transition'
                          />
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Prescription