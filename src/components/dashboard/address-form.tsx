"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Temporarily disabled - missing UI components
// import { CountrySelect } from "@/components/ui/country-select"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  addressType: 'personal' | 'company'
  companyName?: string
  vatNumber?: string
}

interface AddressFormProps {
  address?: Address
  onSave: (address: Address) => void
  onCancel: () => void
}

export default function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'US',
    addressType: address?.addressType || 'personal',
    companyName: address?.companyName || '',
    vatNumber: address?.vatNumber || ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.line1) newErrors.line1 = 'Address line 1 is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State/Province is required'
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required'
    if (!formData.country) newErrors.country = 'Country is required'

    if (formData.addressType === 'company' && !formData.companyName) {
      newErrors.companyName = 'Company name is required for business addresses'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>
          Enter your address details for billing and shipping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Type Selection - Simplified */}
          <div className="space-y-2">
            <Label>Address Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="addressType" 
                  value="personal"
                  checked={formData.addressType === 'personal'}
                  onChange={(e) => handleInputChange('addressType', e.target.value)}
                />
                Personal
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="addressType" 
                  value="company"
                  checked={formData.addressType === 'company'}
                  onChange={(e) => handleInputChange('addressType', e.target.value)}
                />
                Company
              </label>
            </div>
          </div>

          {/* Company Fields */}
          {formData.addressType === 'company' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && <p className="text-sm text-red-600">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Address Fields */}
          <div className="space-y-2">
            <Label htmlFor="line1">Address Line 1</Label>
            <Input
              id="line1"
              value={formData.line1}
              onChange={(e) => handleInputChange('line1', e.target.value)}
              className={errors.line1 ? 'border-red-500' : ''}
            />
            {errors.line1 && <p className="text-sm text-red-600">{errors.line1}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
            <Input
              id="line2"
              value={formData.line2}
              onChange={(e) => handleInputChange('line2', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && <p className="text-sm text-red-600">{errors.postalCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="NL">Netherlands</option>
              </select>
              {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Address</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}