const plugin = requirePlugin("quecPlugin");

const ROLE_PAGE_NUM = 1;
const ROLE_PAGE_SIZE = 10000;

const ROLE_TYPE = {
  MANAGE: "manage",
  DEVICE: "device",
};

/**
 * 通用角色查询方法
 * @param {string} roleType
 * @param {string} deviceKey
 * @param {string} productKey
 * @returns
 */
function generalGetRolesApiCall(roleType, deviceKey, productKey) {
  return new Promise((resolve, reject) => {
    plugin.ai.roleFindPage({
      deviceKey: deviceKey,
      productKey: productKey,
      pageNum: ROLE_PAGE_NUM,
      pageSize: ROLE_PAGE_SIZE,
      roleType: roleType,
      success: (res) => {
        resolve(res?.rows || []);
      },
      fail: (res) => {
        reject(res);
      },
    });
  });
}

/**
 * 获取所有角色列表
 * @param {string} deviceKey
 * @param {string} productKey
 * @returns
 */
async function getAllRolesList(deviceKey, productKey) {
  const roleTypes = [ROLE_TYPE.MANAGE, ROLE_TYPE.DEVICE];
  const promises = roleTypes.map((roleType) =>
    generalGetRolesApiCall(roleType, deviceKey, productKey)
  );

  return Promise.all(promises)
    .then((res) => {
      return res.flat();
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

module.exports = {
  getAllRolesList,
};
