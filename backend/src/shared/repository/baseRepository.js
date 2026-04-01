// backend/src/shared/repository/baseRepository.js
// Generic CRUD repository for Sequelize models

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async create(payload, options = {}) {
    return this.model.create(payload, options);
  }

  async update(id, payload, options = {}) {
    await this.model.update(payload, { where: { id }, ...options });
    return this.findById(id, options);
  }

  async delete(id, options = {}) {
    return this.model.destroy({ where: { id }, ...options });
  }
}

module.exports = BaseRepository;
