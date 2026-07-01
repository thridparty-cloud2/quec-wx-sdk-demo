Component({
  properties: {
    rolesList: {
      type: Array,
      value: [],
    },
    curRoleId: {
      type: Number,
      value: 0,
    },
  },

  data: {
    arrowDirection: "down",
    showPopup: false,
    options: [],
    isSelecting: false,
    curRoleViewId: "",
  },

  observers: {
    "rolesList, curRoleId": function (rolesList, curRoleId) {
      if (rolesList && rolesList.length > 0) {
        let selectedIndex = rolesList.findIndex((role) => role.roleId === curRoleId)
        if (selectedIndex === -1) {
          selectedIndex = 0
        }
        const options = rolesList.map((role, index) => ({
          name: role.roleName,
          roleId: role.roleId,
          rolePicUrl: role.rolePicUrl,
          supplier: role.supplier,
          selected: index === selectedIndex,
        }))
        this.setData({
          options: options,
        })
        if (options.length > 0) {
          this.setData({
            selectedName: options[selectedIndex].name,
          })
          this.triggerEvent("select", {
            selectedName: options[selectedIndex].name,
            roleId: options[selectedIndex].roleId,
            rolePicUrl: options[selectedIndex].rolePicUrl,
            supplier: options[selectedIndex].supplier,
          })
        }
      }
    },
  },

  methods: {
    toggleArrow() {
      const newDirection = this.data.arrowDirection === "down" ? "up" : "down"
      const showPopup = newDirection === "up"
      let curRoleViewId = ""

      if (showPopup) {
        const selectedIndex = this.data.options.findIndex((option) => option.selected)
        if (selectedIndex !== -1) {
          curRoleViewId = `option-${selectedIndex}`
        }
      }
      this.setData({
        arrowDirection: newDirection,
        showPopup: showPopup,
        curRoleViewId: curRoleViewId,
      })
    },

    selectOption(e) {
      if (this.data.isSelecting) {
        return
      }
      const { index } = e.currentTarget.dataset

      if (this.data.options[index] && this.data.options[index].selected) {
        this.setData({
          showPopup: false,
          arrowDirection: "down",
        })
        return
      }

      this.setData({
        isSelecting: true,
      })

      const options = this.data.options.map((item, i) => ({
        ...item,
        selected: i === index,
      }))

      this.setData({
        options: options,
        selectedName: options[index].name,
        showPopup: false,
        arrowDirection: "down",
      })

      this.triggerEvent("select", {
        selectedName: options[index].name,
        roleId: options[index].roleId,
        rolePicUrl: options[index].rolePicUrl,
        supplier: options[index].supplier,
      })

      setTimeout(() => {
        this.setData({
          isSelecting: false,
        })
      }, 500)
    },

    closePopup() {
      this.setData({
        showPopup: false,
        arrowDirection: "down",
      })
    },
  },
})
