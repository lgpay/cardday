const { createApp, ref, watch, computed } = Vue
const { ElMessage, ElMessageBox } = ElementPlus

const STORAGE_KEY = 'credit-cards'

const createEmptyForm = () => ({
    name: '',
    bank: '',
    billDay: null,
    billMode: '',
    gracePeriod: null,
    fixedRepaymentDay: null,
    billCycle: 'current'
})

const clampDay = (year, month, day) => {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return Math.min(day, lastDay)
}

const formatDate = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getNextBillDate = (card) => {
    const today = new Date()
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), clampDay(today.getFullYear(), today.getMonth(), card.billDay))

    if (today <= currentMonthDate) {
        return currentMonthDate
    }

    return new Date(today.getFullYear(), today.getMonth() + 1, clampDay(today.getFullYear(), today.getMonth() + 1, card.billDay))
}

const getRepaymentDate = (billDate, card) => {
    if (card.billMode === 'grace') {
        const repaymentDate = new Date(billDate)
        repaymentDate.setDate(repaymentDate.getDate() + Number(card.gracePeriod || 0))
        return repaymentDate
    }

    const nextMonth = new Date(billDate.getFullYear(), billDate.getMonth() + 1, 1)
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), clampDay(nextMonth.getFullYear(), nextMonth.getMonth(), Number(card.fixedRepaymentDay || 1)))
}

createApp({
    setup() {
        const loadCards = () => {
            const savedCards = localStorage.getItem(STORAGE_KEY)
            return savedCards ? JSON.parse(savedCards) : []
        }

        const banks = ref([
            '工商银行', '建设银行', '农业银行',
            '中国银行', '交通银行', '招商银行',
            '平安银行', '邮政银行', '光大银行',
            '中信银行', '民生银行', '兴业银行', '浦发银行'
        ])

        const cardForm = ref(createEmptyForm())
        const cards = ref(loadCards())
        const editingIndex = ref(-1)

        watch(cards, (newCards) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards))
        }, { deep: true })

        const isEditing = computed(() => editingIndex.value > -1)

        const cardSummaries = computed(() => cards.value.map((card) => {
            const nextBillDate = getNextBillDate(card)
            const nextRepaymentDate = getRepaymentDate(nextBillDate, card)
            return {
                ...card,
                billModeLabel: card.billMode === 'grace'
                    ? `宽限期 ${card.gracePeriod} 天`
                    : `固定每月 ${card.fixedRepaymentDay} 日`,
                nextBillDate: formatDate(nextBillDate),
                nextRepaymentDate: formatDate(nextRepaymentDate)
            }
        }))

        const validateForm = () => {
            if (!cardForm.value.name || !cardForm.value.bank || !cardForm.value.billDay || !cardForm.value.billMode) {
                ElMessage.error('请填写完整信用卡信息')
                return false
            }
            if (cardForm.value.billMode === 'grace' && (cardForm.value.gracePeriod === null || cardForm.value.gracePeriod === undefined)) {
                ElMessage.error('请填写宽限期天数')
                return false
            }
            if (cardForm.value.billMode === 'fixed' && !cardForm.value.fixedRepaymentDay) {
                ElMessage.error('请填写固定还款日')
                return false
            }
            return true
        }

        const resetAdditionalFields = () => {
            cardForm.value.gracePeriod = null
            cardForm.value.fixedRepaymentDay = null
        }

        const resetForm = () => {
            cardForm.value = createEmptyForm()
            editingIndex.value = -1
        }

        const submitCard = () => {
            if (!validateForm()) return

            const payload = { ...cardForm.value }
            if (isEditing.value) {
                cards.value[editingIndex.value] = payload
                ElMessage.success('信用卡更新成功')
            } else {
                cards.value.push(payload)
                ElMessage.success('信用卡添加成功')
            }
            resetForm()
        }

        const startEdit = (index) => {
            editingIndex.value = index
            cardForm.value = { ...cards.value[index] }
        }

        const cancelEdit = () => {
            resetForm()
            ElMessage.info('已取消编辑')
        }

        const deleteCard = (index) => {
            ElMessageBox.confirm('确定要删除这张信用卡吗？', '提示', {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                cards.value.splice(index, 1)
                if (editingIndex.value === index) {
                    resetForm()
                }
                ElMessage.success('信用卡删除成功')
            }).catch(() => {})
        }

        return {
            banks,
            cardForm,
            cards,
            isEditing,
            cardSummaries,
            resetAdditionalFields,
            submitCard,
            startEdit,
            cancelEdit,
            deleteCard,
            resetForm
        }
    }
}).use(ElementPlus).mount('#app')
