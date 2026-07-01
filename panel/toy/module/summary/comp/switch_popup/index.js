Component({
  properties: {
    title: {
      type: String,
      value: "互动总结",
    },
    selectedName: {
      type: String,
      value: "",
    },
    rolesList: {
      type: Array,
      value: [],
    },
    curRoleId: {
      type: Number,
      value: null,
    },
  },

  data: {
    arrowDirection: "down",
    showPopup: false,
    options: [],
    curRoleViewId: "",
    activeRoleId: null, // 用户当前实际选中的角色ID（记忆用户选择，避免列表刷新后被重置）
  },

  observers: {
    "rolesList, curRoleId": function (rolesList, curRoleId) {
      if (!rolesList || rolesList.length === 0) {
        this.setData({ options: [], selectedName: "" });
        return;
      }
      const { activeRoleId } = this.data;
      let selectedIndex = -1;
      if (activeRoleId != null) {
        selectedIndex = rolesList.findIndex(
          (role) => role.roleId === activeRoleId,
        );
      }
      if (selectedIndex === -1 && curRoleId != null) {
        selectedIndex = rolesList.findIndex(
          (role) => role.roleId === curRoleId,
        );
      }
      if (selectedIndex === -1) selectedIndex = 0;

      const normalizedOptions = rolesList.map((role, i) => ({
        name: role.roleName,
        roleId: role.roleId,
        selected: i === selectedIndex,
      }));
      const selectedOption = normalizedOptions[selectedIndex];
      this.setData({
        options: normalizedOptions,
        selectedName: selectedOption.name,
        activeRoleId: selectedOption.roleId,
      });
      this.triggerEvent("select", {
        selectedName: selectedOption.name,
        roleId: selectedOption.roleId,
      });
    },
  },

  lifetimes: {
    attached() {},
  },

  methods: {
    toggleArrow() {
      const newDirection = this.data.arrowDirection === "down" ? "up" : "down";
      const showPopup = newDirection === "up";
      let curRoleViewId = "";

      if (showPopup) {
        const selectedIndex = this.data.options.findIndex(
          (option) => option.selected,
        );
        if (selectedIndex !== -1) {
          curRoleViewId = `option-${selectedIndex}`;
        }
      }

      this.setData({
        arrowDirection: newDirection,
        showPopup: showPopup,
        curRoleViewId: curRoleViewId,
      });
    },

    selectOption(e) {
      const { index } = e.currentTarget.dataset;
      const options = this.data.options.map((item, i) => ({
        ...item,
        selected: i === index,
      }));

      this.setData({
        options: options,
        selectedName: options[index].name,
        activeRoleId: options[index].roleId, // 记录用户的实际选择
        showPopup: false,
        arrowDirection: "down",
      });

      this.triggerEvent("select", {
        selectedName: options[index].name,
        roleId: options[index].roleId,
      });
    },

    closePopup() {
      this.setData({
        showPopup: false,
        arrowDirection: "down",
      });
    },
  },
});
