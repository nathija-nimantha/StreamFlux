"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { RequireAuth } from "@/components/require-auth"
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Monitor, LogOut, Camera, Save, Calendar, Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { profileStore, favoritesStore, type UserProfile as LocalUserProfile } from "@/lib/favorites-store"
import countries from '@/data/countries.json'
import { updateUserDocument } from '@/lib/firebase'
import { toast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/hooks/use-current-user'
import { updateUserPreferences } from '@/lib/firebase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  // country can only be set once; if it's already present, block further edits
  const [allowCountryEdit, setAllowCountryEdit] = useState(false)
  const { user, profile: remoteProfile, loading: loadingAuth, profileLoading } = useCurrentUser()
  const [profile, setProfile] = useState<LocalUserProfile>(profileStore.getProfile())
  const [newPassword, setNewPassword] = useState("")
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [tempAvatarBlob, setTempAvatarBlob] = useState<Blob | null>(null)

  const [settings, setSettings] = useState({
    emailNotification: true,
    pushNotification: false,
    autoPlayNextEp: true,
    hqQuality: true,
  })
  const [countryQuery, setCountryQuery] = useState("")

  useEffect(() => {
    // If we have a remote profile from Firestore, map it into the local shape
      if (remoteProfile) {
      setProfile({
        name: remoteProfile.fullName ?? '',
        email: remoteProfile.email ?? '',
        avatar: remoteProfile.avatar ?? '',
        memberSince: remoteProfile.createdAt ? (remoteProfile.createdAt?.toDate ? remoteProfile.createdAt.toDate() : new Date()) : new Date(),
  country: remoteProfile.country ?? undefined,
  birthday: remoteProfile.birthday ?? undefined,
      })
      // initialize settings from remote profile
      if (remoteProfile.preferences) {
        setSettings({
          emailNotification: !!remoteProfile.preferences.emailNotification,
          pushNotification: !!remoteProfile.preferences.pushNotification,
          autoPlayNextEp: !!remoteProfile.preferences.autoPlayNextEp,
          hqQuality: !!remoteProfile.preferences.hqQuality,
        })
      }
    } else {
      setProfile(profileStore.getProfile())
    }

    const updateFavoriteCount = async () => {
      if (user) {
        const favs = await favoritesStore.fetchFavoritesFromDb()
        setFavoriteCount(favs.length)
      } else {
        setFavoriteCount(favoritesStore.getFavorites().length)
      }
    }

    updateFavoriteCount()

    const handleFavoritesChange = async () => {
      if (user) {
        const favs = await favoritesStore.fetchFavoritesFromDb()
        setFavoriteCount(favs.length)
      } else {
        setFavoriteCount(favoritesStore.getFavorites().length)
      }
    }

    window.addEventListener("favorites-changed", handleFavoritesChange)
    return () => window.removeEventListener("favorites-changed", handleFavoritesChange)
  }, [remoteProfile])

  // while we wait for the user's profile from Firestore, show the loader
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-12 w-12 text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in">
              <h2 className="text-xl font-bold">Please sign in</h2>
              <p className="text-muted-foreground mt-2">You must be signed in to view your profile.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const handleSave = async () => {
    // Don't persist the potentially-large data URL to localStorage.
    // We'll update local profile store only after any upload completes and we have a remote URL.
    if (newPassword) {
      // In a real app, this would update the password
      console.log("Password would be updated")
      setNewPassword("")
    }
    // persist to Firestore if user is logged in
    if (user) {
      try {
        // If a new avatar blob exists, upload it first and include the url in the update
        let avatarUrl: string | undefined = undefined
        if (tempAvatarBlob) {
          try {
            const { uploadProfileImage } = await import('@/lib/firebase')
            avatarUrl = await uploadProfileImage(user.uid, tempAvatarBlob)
            // update local preview to the uploaded url
            setProfile((p) => ({ ...p, avatar: avatarUrl ?? p.avatar }))
            setTempAvatarBlob(null)
          } catch (uploadErr: any) {
            console.error('Failed to upload avatar', uploadErr)
            toast({ title: 'Failed to upload avatar', description: uploadErr?.message })
          }
        }

        const updateData: Record<string, any> = {
          fullName: profile.name,
          birthday: profile.birthday || null,
          country: profile.country || null,
        }
        if (avatarUrl) updateData.avatar = avatarUrl

        await updateUserDocument(user.uid, updateData)

        // Now update the local profile store with the remote avatar URL (if we have one)
        const localProfileUpdate: Partial<typeof profile> = { ...profile }
        if (avatarUrl) {
          localProfileUpdate.avatar = avatarUrl
        } else {
          // ensure we don't persist a data URL
          if (typeof localProfileUpdate.avatar === 'string' && localProfileUpdate.avatar.startsWith('data:')) {
            localProfileUpdate.avatar = ''
          }
        }
        profileStore.updateProfile(localProfileUpdate)

        // update password if provided
        if (newPassword) {
          try {
            await (await import('@/lib/firebase')).updatePassword(newPassword)
            toast({ title: 'Password updated' })
            setNewPassword("")
          } catch (pwErr: any) {
            // Common error: requires-recent-login
            const code = pwErr?.code
            if (code === 'auth/requires-recent-login') {
              toast({ title: 'Please re-login', description: 'For security, please sign out and sign in again to change your password.' })
            } else {
              toast({ title: 'Failed to update password', description: pwErr?.message })
            }
          }
        }

        toast({ title: 'Profile saved' })
      } catch (e: any) {
        toast({ title: 'Failed to save profile', description: e?.message })
      }
    }
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        const canvas = document.createElement('canvas')
        const dpr = window.devicePixelRatio || 1
        canvas.width = size * dpr
        canvas.height = size * dpr
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(dpr, dpr)
          ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
          const dataUrl = canvas.toDataURL('image/png')
          setProfile({ ...profile, avatar: dataUrl })
          canvas.toBlob((b) => {
            if (b) setTempAvatarBlob(b)
          }, 'image/png')
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <MainNav />

      <main className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Profile Header */}
          <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-foreground" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <div className="glass px-3 py-1 rounded-full text-sm">
                    <span className="text-muted-foreground">Member since</span>{" "}
                    <span className="text-foreground font-medium">
                      {new Date(profile.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="glass px-3 py-1 rounded-full text-sm">
                    <span className="text-muted-foreground">Favorites</span>{" "}
                    <span className="text-foreground font-medium">{favoriteCount}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-foreground">
                  Full Name
                </Label>
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="glass border-border/50 focus:border-primary bg-background/50 text-foreground disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email" className="text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    // Email is immutable from the profile UI for security reasons
                    disabled={true}
                    className="pl-10 glass border-border/50 focus:border-primary bg-background/50 text-foreground disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-birthday" className="text-foreground">
                  Birthday
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="profile-birthday"
                    type="date"
                    value={profile.birthday || ""}
                    onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass border-border/50 focus:border-primary bg-background/50 text-foreground disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-country" className="text-foreground">
                  Country
                </Label>
                <div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select
                      value={profile.country || ""}
                      onValueChange={(value) => setProfile({ ...profile, country: value })}
                      // allow editing only if user is editing AND country is not already set
                      disabled={!(isEditing && (profile.country === undefined || profile.country === ""))}
                    >
                      <SelectTrigger className="pl-10 glass border-border/50 focus:border-primary bg-background/50 text-foreground disabled:opacity-70">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-3 pb-2">
                          <Input
                            value={countryQuery}
                            onChange={(e) => setCountryQuery(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full glass border-border/50 bg-background/50 text-foreground"
                          />
                        </div>
                        <div className="max-h-56 overflow-auto">
                          {countries
                            .filter((c) =>
                              c.name.toLowerCase().includes(countryQuery.toLowerCase()) ||
                              c.code.toLowerCase().includes(countryQuery.toLowerCase()),
                            )
                            .map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* If country exists and user is editing but not yet allowed, show warning and action */}
                  {/* If country is set, editing is blocked (country can only be set once) */}
                  {isEditing && profile.country && (
                    <div className="mt-2 text-sm text-muted-foreground">Country is set and cannot be changed.</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="profile-password" className="text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="profile-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="pl-10 glass border-border/50 focus:border-primary bg-background/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Preferences
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about new releases</p>
                </div>
                <Switch
                  checked={settings.emailNotification}
                  onCheckedChange={async (checked) => {
                    const next = { ...settings, emailNotification: checked }
                    setSettings(next)
                    if (!user) return
                    try {
                      await updateUserPreferences(user.uid, {
                        emailNotification: next.emailNotification,
                        pushNotification: next.pushNotification,
                        autoPlayNextEp: next.autoPlayNextEp,
                        hqQuality: next.hqQuality,
                      })
                      toast({ title: 'Preferences updated' })
                    } catch (e: any) {
                      toast({ title: 'Failed to update preferences', description: e?.message })
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about trending content</p>
                </div>
                <Switch
                  checked={settings.pushNotification}
                  onCheckedChange={async (checked) => {
                    const next = { ...settings, pushNotification: checked }
                    setSettings(next)
                    if (!user) return
                    try {
                      await updateUserPreferences(user.uid, {
                        emailNotification: next.emailNotification,
                        pushNotification: next.pushNotification,
                        autoPlayNextEp: next.autoPlayNextEp,
                        hqQuality: next.hqQuality,
                      })
                      toast({ title: 'Preferences updated' })
                    } catch (e: any) {
                      toast({ title: 'Failed to update preferences', description: e?.message })
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Autoplay Next Episode</Label>
                  <p className="text-sm text-muted-foreground">Automatically play the next episode</p>
                </div>
                <Switch
                  checked={settings.autoPlayNextEp}
                  onCheckedChange={async (checked) => {
                    const next = { ...settings, autoPlayNextEp: checked }
                    setSettings(next)
                    if (!user) return
                    try {
                      await updateUserPreferences(user.uid, {
                        emailNotification: next.emailNotification,
                        pushNotification: next.pushNotification,
                        autoPlayNextEp: next.autoPlayNextEp,
                        hqQuality: next.hqQuality,
                      })
                      toast({ title: 'Preferences updated' })
                    } catch (e: any) {
                      toast({ title: 'Failed to update preferences', description: e?.message })
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">HD Quality</Label>
                  <p className="text-sm text-muted-foreground">Stream in high definition when available</p>
                </div>
                <Switch
                  checked={settings.hqQuality}
                  onCheckedChange={async (checked) => {
                    const next = { ...settings, hqQuality: checked }
                    setSettings(next)
                    if (!user) return
                    try {
                      await updateUserPreferences(user.uid, {
                        emailNotification: next.emailNotification,
                        pushNotification: next.pushNotification,
                        autoPlayNextEp: next.autoPlayNextEp,
                        hqQuality: next.hqQuality,
                      })
                      toast({ title: 'Preferences updated' })
                    } catch (e: any) {
                      toast({ title: 'Failed to update preferences', description: e?.message })
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="glass-strong rounded-2xl p-6 sm:p-8 border-2 border-destructive/20 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <h2 className="text-xl font-bold text-destructive mb-4">Danger Zone</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-foreground font-medium mb-1">Sign Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
              </div>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={async () => {
                  try {
                    const { signOutAndClear } = await import('@/lib/firebase')
                    await signOutAndClear()
                    toast({ title: 'Signed out' })
                    // navigate to home
                    window.location.href = '/'
                  } catch (e: any) {
                    toast({ title: 'Failed to sign out', description: e?.message })
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </RequireAuth>
  )
}
