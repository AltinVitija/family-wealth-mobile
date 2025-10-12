import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomTextInput from 'src/components/inputs/custom-textfield';
import CustomButton from 'src/components/buttons/custom-button';
import { CreateEstatePlanRequest, EstatePlanStatus, FormErrors } from 'src/types/estatePlan';

interface AddEstatePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEstatePlanRequest) => Promise<void>;
}

const AddEstatePlanModal: React.FC<AddEstatePlanModalProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateEstatePlanRequest>({
    title: '',
    description: '',
    status: 'draft',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions: { value: EstatePlanStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: '#fbbf24' },
    { value: 'active', label: 'Active', color: '#10b981' },
    { value: 'archived', label: 'Archived', color: '#6b7280' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create estate plan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', status: 'draft' });
    setErrors({});
    onClose();
  };

  const handleFieldChange = (field: keyof CreateEstatePlanRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/50" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="max-h-[90%] rounded-t-3xl bg-white">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-5">
                <View>
                  <Text className="text-2xl font-bold text-gray-900">Create Estate Plan</Text>
                  <Text className="mt-1 text-sm text-gray-600">Start planning your legacy</Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                  disabled={isLoading}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              <ScrollView
                className="px-6 py-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Estate Plan Title */}
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">
                    Plan Title <Text className="text-red-500">*</Text>
                  </Text>
                  <CustomTextInput
                    label="e.g., Family Estate Plan 2025"
                    value={formData.title}
                    onChangeText={(text) => handleFieldChange('title', text)}
                    currentLength={formData.title.length}
                    placeholder="Enter plan title"
                    editable={!isLoading}
                    borderRadius={12}
                    errorMessage={errors.title || null}
                    maxLength={100}
                  />
                </View>

                {/* Description */}
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">Description</Text>
                  <CustomTextInput
                    label="Add details about your estate plan..."
                    value={formData.description || ''}
                    onChangeText={(text) => handleFieldChange('description', text)}
                    currentLength={formData.description?.length || 0}
                    placeholder="Optional description"
                    editable={!isLoading}
                    borderRadius={12}
                    errorMessage={errors.description || null}
                    maxChars={500}
                    showCharacterCount={true}
                    multiline={true}
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                  />
                </View>

                {/* Status Selection */}
                <View className="mb-6">
                  <Text className="mb-3 text-sm font-semibold text-gray-700">Initial Status</Text>
                  <View className="flex-row gap-3">
                    {statusOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setFormData((prev) => ({ ...prev, status: option.value }))}
                        disabled={isLoading}
                        className={`flex-1 items-center rounded-xl border-2 py-4 ${
                          formData.status === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}>
                        <View
                          className="mb-2 h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${option.color}20` }}>
                          <View
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                        </View>
                        <Text
                          className={`text-sm font-semibold ${
                            formData.status === option.value ? 'text-blue-600' : 'text-gray-700'
                          }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text className="mt-2 text-xs text-gray-500">
                    You can change the status later
                  </Text>
                </View>

                {/* General Error */}
                {errors.general && (
                  <View className="mb-4 rounded-lg bg-red-100 p-4">
                    <Text className="text-center text-sm text-red-600">{errors.general}</Text>
                  </View>
                )}

                {/* Info Box */}
                <View className="mb-6 rounded-xl bg-blue-50 p-4">
                  <View className="mb-2 flex-row items-center">
                    <Ionicons name="information-circle" size={20} color="#3b82f6" />
                    <Text className="ml-2 font-semibold text-blue-900">What's Next?</Text>
                  </View>
                  <Text className="text-sm leading-5 text-blue-800">
                    After creating your estate plan, you can add assets, designate beneficiaries,
                    and appoint an executor.
                  </Text>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View className="border-t border-gray-200 px-6 py-4">
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isLoading}
                    className="flex-1 items-center justify-center rounded-xl border-2 border-gray-300 py-4">
                    <Text className="font-semibold text-gray-700">Cancel</Text>
                  </TouchableOpacity>
                  <View className="flex-1">
                    <CustomButton
                      text="Create Plan"
                      clicked={true}
                      itemClickedTextColor="#fff"
                      itemClickedBackgroundColor="#3b82f6"
                      itemUnClickedBackgroundColor="#3b82f6"
                      itemBorderRadius={12}
                      click={handleSubmit}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="h-14"
                    />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default AddEstatePlanModal;
